import {
  Body,
  Controller,
  Get,
  Patch,
  Redirect,
  Render,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // 프로필 페이지 렌더링
  @Get()
  @Render('user/profile')
  renderProfilePage(@GetUser() user: User) {
    return this.userService.renderProfilePage(user);
  }

  // 프로필 수정 페이지 렌더링
  @Get('edit')
  @Render('user/profile-edit')
  renderProfileEditPage(@GetUser() user: User) {
    return this.userService.renderProfileEditPage(user);
  }

  // 프로필 수정
  @Patch('edit')
  @Redirect('/')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
