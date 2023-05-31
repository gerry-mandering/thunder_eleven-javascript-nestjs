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

  //Jwt토큰 로그인 시에만 반환하는 방식으로 수정
  async signup(signupDto: SignupDto, response: Response) {
    // 패스워드 해시 생성
    const hash = await argon.hash(signupDto.password);
    try {
      // DB에 유저 저장
      const user = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          hash,
          userName: signupDto.userName,
        },
      });

      // 저장된 유저 리턴
      return this.setJwtToCookie(user.id, user.email, response);
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signin(signinDto: SigninDto, response: Response) {
    // 이메일로 유저 찾기
    const user = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });

    // 유저가 존재하지 않으면 에러
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // 비밀번호 비교
    const pwMatches = await argon.verify(user.hash, signinDto.password);

    // 비밀번호가 일치하지 않으면 에러
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    // 유저 리턴
    return this.setJwtToCookie(user.id, user.email, response);
  }

  async setJwtToCookie(
    userId: number,
    email: string,
    response: Response,
  ): Promise<{ access_token: string }> {
    const payolad = {
      sub: userId,
      email,
    };

    const secret = await this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payolad, {
      expiresIn: '15m',
      secret: secret,
    });

    await response.cookie('jwt', token, { httpOnly: true, secure: true });

    return {
      access_token: token,
    };
  }
}
