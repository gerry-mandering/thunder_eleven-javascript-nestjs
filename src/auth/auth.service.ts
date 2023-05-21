import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
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
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signin(signinDto: SigninDto) {
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
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payolad = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payolad, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
