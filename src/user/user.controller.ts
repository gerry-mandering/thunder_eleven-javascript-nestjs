import {
  Body,
  Controller,
  Get,
  Patch,
  Redirect,
  Render,
  Req,
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

  @Get()
  @Render('user/profile')
  renderProfilePage(@GetUser() user: User) {
    return this.userService.renderProfilePage(user);
  }

  @Get('edit')
  @Render('user/profile-edit')
  renderProfileEditPage(@GetUser() user: User) {
    return this.userService.renderProfileEditPage(user);
  }

  @Patch('edit')
  @Redirect('/')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    this.userService.editUser(userId, dto);
  }
}
