import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 프로필 페이지 렌더링
  renderProfilePage(user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  // 프로필 수정 페이지 렌더링
  renderProfileEditPage(user: User) {
    return {
      userName: user.userName,
      email: user.email,
    };
  }

  // 프로필 수정
  async editUser(userId: number, dto: EditUserDto) {
    // DB 유저 정보 갱신
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    // 유저에서 hash 필드 삭제
    delete user.hash;

    // 갱신된 유저 반환
    return user;
  }
}
