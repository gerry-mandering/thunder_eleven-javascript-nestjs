import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CanAccessAwayTeamGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const matchResultId = request.params.id;

    try {
      // Prisma를 사용하여 matchResultId에 해당하는 matchResult를 조회합니다.
      const matchResult = await this.prisma.matchResult.findUnique({
        where: { id: Number(matchResultId) },
        include: {
          awayTeam: true,
          homeTeam: true,
        },
      });

      if (!matchResult) {
        return false;
      }

      if (
        matchResult.homeTeam.id === user.id ||
        matchResult.awayTeam.id === user.id
      ) {
        return true;
      }
      return false; // 접근 거부
    } catch (error) {
      console.error(error);
      return false; // 에러 발생 시 접근 거부
    }
  }
}
