import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import { MatchService } from '../match/match.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchResultService {
  constructor(private prisma: PrismaService) {}
  findTeam(userId: number) {
    return this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });
  }

  getResult() {
    return this.prisma.matchResult.findMany({});
  }

  async mannerUp(userId: number, matchResultId: number) {
    const team = await this.findTeam(userId);
    const matchResult = await this.prisma.matchResult.findUnique({
      where: { id: matchResultId },
      include: { awayTeam: true, homeTeam: true },
    });

    if (!matchResult) throw new NotFoundException('Access to resources denied');

    if (
      matchResult.homeTeamId === team.id ||
      matchResult.awayTeamId === team.id
    ) {
      await this.prisma.matchResult.update({
        where: { id: matchResultId },
        data: {
          awaymannerRate: Evaluation.GOOD,
        },
      });

      if (team.mannerCount >= 1) {
        return matchResult;
      }

      await this.prisma.team.update({
        where: { id: team.id },
        data: {
          mannerRate: {
            set: team.mannerRate + 1,
          },
          mannerCount: {
            set: team.mannerRate + 1,
          },
        },
      });
    }
    return matchResult;
  }
}
