import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  renderProfilePage(user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  renderProfileEditPage(user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }
}
