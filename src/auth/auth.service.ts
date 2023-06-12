import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // 회원가입
  async signup(dto: SignupDto, response: Response) {
    // 패스워드 해시 생성
    const hash = await argon.hash(dto.password);

    try {
      // DB에 유저 저장
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          userName: dto.userName,
        },
      });

      // 유저에서 hash 필드 삭제
      delete user.hash;

      // 가입된 유저 반환
      return user;
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  // 로그인
  async signin(dto: SigninDto, response: Response) {
    // 이메일로 유저 찾기
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // 유저가 존재하지 않으면 에러
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // 비밀번호 비교
    const pwMatches = await argon.verify(user.hash, dto.password);

    // 비밀번호가 일치하지 않으면 에러
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    // JWT 토큰을 쿠키에 저장
    await this.setJwtToCookie(user.id, user.email, response);

    // 유저에서 hash 필드 삭제
    delete user.hash;

    // 로그인 한 유저 반환
    return user;
  }

  // JWT 토큰을 쿠키에 저장
  async setJwtToCookie(
    userId: number,
    email: string,
    response: Response,
  ): Promise<{ access_token: string }> {
    // Payload 생성
    const payload = {
      sub: userId,
      email,
    };

    // Config로 부터 비밀 키 가져오기
    const secret = await this.config.get('JWT_SECRET');

    // 서명하여 토큰 발급받기
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m', // 만료 기간 15분
      secret: secret,
    });

    // 브라우저 쿠키에 JWT 토큰 저장
    await response.cookie('jwt', token, { httpOnly: true, secure: true });

    return {
      access_token: token,
    };
  }
}
