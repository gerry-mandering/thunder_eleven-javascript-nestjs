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

  @Get('signup')
  showSignupPage(@Res() response: Response) {
    response.sendFile('auth/signup.html', { root: 'public' });
  }

  @Post('signup')
  @Redirect('/auth/signin')
  signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signup(signupDto, response);
  }

  @Get('signin')
  showSigninPage(@Res() response: Response) {
    response.sendFile('auth/signin.html', { root: 'public' });
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @Redirect('/')
  signin(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signin(signinDto, response);
  }
}
