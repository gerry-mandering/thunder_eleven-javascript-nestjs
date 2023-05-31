import {
  Body,
  Controller,
  Get,
  Patch, Redirect,
  Render,
  Req,
  UseGuards
} from "@nestjs/common";
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @Render('user/profile')
  showProfilePage(@GetUser() user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  @Get('profile/edit')
  @Render('user/profile-edit')
  showProfileEditPage(@GetUser() user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  @Patch('profile')
  @Redirect('/', 301)
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    this.userService.editUser(userId, dto);
  }
}
