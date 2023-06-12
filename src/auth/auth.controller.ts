import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 회원가입 페이지 렌더링
  @Get('signup')
  renderSignupPage(@Res() response: Response) {
    response.sendFile('auth/signup.html', { root: 'public' });
  }

  // 회원가입
  @Post('signup')
  @Redirect('/auth/signin')
  signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signup(dto, response);
  }

  // 로그인 페이지 렌더링
  @Get('signin')
  renderSigninPage(@Res() response: Response) {
    response.sendFile('auth/signin.html', { root: 'public' });
  }

  // 로그인
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @Redirect('/')
  signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signin(dto, response);
  }
}
