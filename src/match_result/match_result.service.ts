import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditMatchResultdto } from './dto';
import { EditCommentdto } from './dto/edit-commentdto';
import { log } from 'console';

@Injectable()
export class MatchResultService {
  constructor(private prisma: PrismaService) {}

  //공통로직
  findTeam(teamId: number) {
    return this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });
  }

  findMatch(matchId: number) {
    return this.prisma.match.findFirst({
      where: {
        id: matchId,
      },
    });
  }

  findMatchResult(matchResultId: number) {
    return this.prisma.matchResult.findFirst({
      where: {
        id: matchResultId,
      },
    });
  }

  //매치결과창 가져오기
  async getMatchResults() {
    const matchResults = await this.prisma.matchResult.findMany({});

    for (const matchResult of matchResults) {
      const match = await this.prisma.match.findUnique({
        where: {
          id: matchResult.matchId,
        },
      });

      const homeTeam = await this.prisma.team.findUnique({
        where: {
          id: match.homeTeamId,
        },
      });

      const awayTeam = await this.prisma.team.findUnique({
        where: {
          id: match.awayTeamId,
        },
      });

      matchResult['match'] = match;
      matchResult['homeTeam'] = homeTeam;
      matchResult['awayTeam'] = awayTeam;
    }

    return {
      matchResults,
    };
  }

  async renderMatchResultPage(matchResultId: number) {
    const matchResult = await this.findMatchResult(matchResultId);

    const match = await this.prisma.match.findUnique({
      where: {
        id: matchResult.matchId,
      },
    });

    const homeTeam = await this.prisma.team.findUnique({
      where: {
        id: match.homeTeamId,
      },
    });

    const awayTeam = await this.prisma.team.findUnique({
      where: {
        id: match.awayTeamId,
      },
    });

    const comments = await this.prisma.comment.findMany({
      where: {
        matchResultId,
      },
    });

    for (const comment of comments) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: comment.userId,
        },
      });

      comment['userName'] = user.userName;
    }

    return {
      matchResult,
      match,
      homeTeam,
      awayTeam,
      comments,
    };
  }

  async deleteResult(userId: number, matchResultId: number) {
    const matchResult = await this.findMatchResult(matchResultId);
    if (!matchResult) throw new NotFoundException('NO matchResult');
    //match creatuser만 경기결과 변경가능
    if (matchResult.userId !== userId)
      throw new ForbiddenException('Only match create uesr can access');
    if (matchResult.userId === userId) {
      return await this.prisma.matchResult.delete({
        where: {
          id: matchResultId,
        },
      });
    }
  }

  renderEditScorePage(matchResultId: number) {
    return {
      matchResultId,
    };
  }

  async editScore(
    userId: number,
    matchResultId: number,
    dto: EditMatchResultdto,
  ) {
    const matchResult = await this.findMatchResult(matchResultId);
    if (!matchResult) throw new NotFoundException('NO matchResult');
    //match creatuser만 경기결과 변경가능

    if (matchResult.userId !== userId)
      throw new ForbiddenException('Only match create user can access');
    if (matchResult.userId === userId) {
      return await this.prisma.matchResult.update({
        where: {
          id: matchResultId,
        },
        data: {
          homeTeamScore: dto.homeTeamScore,
          awayTeamScore: dto.awayTeamScore,
        },
      });
    }
  }

  async createComment(
    userId: number,
    matchResultId: number,
    dto: EditCommentdto,
  ) {
    let matchResult = await this.findMatchResult(matchResultId);
    if (!matchResult) throw new NotFoundException('No matchResult');

    await this.prisma.comment.create({
      data: {
        content: dto.commentString,
        userId: userId,
        matchResultId: matchResultId,
      },
    });
    matchResult = await this.findMatchResult(matchResultId);
    return matchResult;
  }

  async editComment(
    userId: number,
    matchResultId: number,
    dto: EditCommentdto,
    commentId: number,
  ) {
    const { commentString } = dto;

    let matchResult = await this.findMatchResult(matchResultId);
    if (!matchResult) throw new NotFoundException('No matchResult');

    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (!comment) throw new NotFoundException('No comment');

    if (comment.userId === userId) {
      await this.prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content: commentString,
          userId: userId, // 코멘트를 수정한 사용자의 userId 저장
        },
      });
    } else {
      throw new ForbiddenException('Only comment create user can access');
    }
    matchResult = await this.findMatchResult(matchResultId);
    return matchResult;
  }

  //매너평가 GOOD
  async mannerUp(userId: number, matchResultId: number, matchId: number) {
    const match = await this.findMatch(matchId);
    const awayteamId = match.awayTeamId;
    const awayteam = await this.findTeam(awayteamId);
    const hometeamId = match.homeTeamId;
    const hometeam = await this.findTeam(hometeamId);
    let matchResult = await this.findMatchResult(matchResultId);

    if (!matchResult) throw new NotFoundException('NO matchResult');
    //로그인한 사람이 hometeamleader일때, awayteam Evaluation GOOD변경
    if (match.homeTeamLeaderId === userId) {
      await this.prisma.matchResult.update({
        where: { id: matchResultId },
        data: {
          awaymannerRate: Evaluation.GOOD,
        },
      });
      // GOOD인데 GOOD또 눌렀을때
      if (
        matchResult.awaymannerCount >= 1 &&
        matchResult.awaymannerRate === Evaluation.GOOD
      ) {
        return matchResult;
      }
      // BAD인데 GOOD 눌렀을때
      if (
        matchResult.awaymannerRate === Evaluation.BAD &&
        matchResult.awaymannerCount === -1
      ) {
        await this.prisma.team.update({
          where: { id: awayteamId },
          data: {
            mannerRate: {
              set: awayteam.mannerRate + 2,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            awaymannerCount: {
              set: matchResult.awaymannerCount + 2,
            },
          },
        });
      }
      // 처음 누를때
      else if (matchResult.awaymannerCount === 0) {
        await this.prisma.team.update({
          where: { id: awayteamId },
          data: {
            mannerRate: {
              set: awayteam.mannerRate + 1,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            awaymannerCount: {
              set: matchResult.awaymannerCount + 1,
            },
          },
        });
      }
      matchResult = await this.findMatchResult(matchResultId);
      return matchResult;
    }
    //로그인한사람이 awayteamleader일때, hometeam Evaluation GOOD변경
    else if (match.awayTeamLeaderId === userId) {
      await this.prisma.matchResult.update({
        where: { id: matchResultId },
        data: {
          homemannerRate: Evaluation.GOOD,
        },
      });
      // GOOD인데 GOOD또 눌렀을때
      if (
        matchResult.homemannerCount >= 1 &&
        matchResult.homemannerRate === Evaluation.GOOD
      ) {
        return await matchResult;
      }
      // BAD인데 GOOD 눌렀을때
      if (
        matchResult.homemannerRate === Evaluation.BAD &&
        matchResult.homemannerCount === -1
      ) {
        await this.prisma.team.update({
          where: { id: hometeamId },
          data: {
            mannerRate: {
              set: hometeam.mannerRate + 2,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            homemannerCount: {
              set: matchResult.homemannerCount + 2,
            },
          },
        });
      }
      // 처음 누를때
      else if (matchResult.homemannerCount === 0) {
        await this.prisma.team.update({
          where: { id: hometeamId },
          data: {
            mannerRate: {
              set: hometeam.mannerRate + 1,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            homemannerCount: {
              set: matchResult.homemannerCount + 1,
            },
          },
        });
      }
      matchResult = await this.findMatchResult(matchResultId);
      return matchResult;
    }
  }

  //매너평가 BAD
  async mannerDown(userId: number, matchResultId: number, matchId: number) {
    const match = await this.findMatch(matchId);
    const awayteamId = match.awayTeamId;
    const awayteam = await this.findTeam(awayteamId);
    const hometeamId = match.homeTeamId;
    const hometeam = await this.findTeam(hometeamId);
    let matchResult = await this.findMatchResult(matchResultId);

    if (!matchResult) throw new NotFoundException('NO matchResult');
    //로그인한 사람이 hometeamleader일때, awayteam Evaluation BAD변경
    if (match.homeTeamLeaderId === userId) {
      await this.prisma.matchResult.update({
        where: { id: matchResultId },
        data: {
          awaymannerRate: Evaluation.BAD,
        },
      });
      // BAD인데 BAD또 눌렀을때
      if (
        matchResult.awaymannerCount === -1 &&
        matchResult.awaymannerRate === Evaluation.BAD
      ) {
        return matchResult;
      }
      // GOOD인데 BAD 눌렀을때
      if (
        matchResult.awaymannerRate === Evaluation.GOOD &&
        matchResult.awaymannerCount === 1
      ) {
        await this.prisma.team.update({
          where: { id: awayteamId },
          data: {
            mannerRate: {
              set: awayteam.mannerRate - 2,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            awaymannerCount: {
              set: matchResult.awaymannerCount - 2,
            },
          },
        });
      }
      // 처음 누를때
      else if (matchResult.awaymannerCount === 0) {
        await this.prisma.team.update({
          where: { id: awayteamId },
          data: {
            mannerRate: {
              set: awayteam.mannerRate - 1,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            awaymannerCount: {
              set: matchResult.awaymannerCount - 1,
            },
          },
        });
      }
      matchResult = await this.findMatchResult(matchResultId);
      return matchResult;
    }
    //로그인한사람이 awayteamleader일때, hometeam Evaluation BAD변경
    else if (match.awayTeamLeaderId === userId) {
      await this.prisma.matchResult.update({
        where: { id: matchResultId },
        data: {
          homemannerRate: Evaluation.BAD,
        },
      });
      // BAD인데 BAD또 눌렀을때
      if (
        matchResult.homemannerCount === -1 &&
        matchResult.homemannerRate === Evaluation.BAD
      ) {
        return matchResult;
      }
      // GOOD인데 BAD 눌렀을때
      if (
        matchResult.homemannerRate === Evaluation.GOOD &&
        matchResult.homemannerCount === 1
      ) {
        await this.prisma.team.update({
          where: { id: hometeamId },
          data: {
            mannerRate: {
              set: hometeam.mannerRate - 2,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            homemannerCount: {
              set: matchResult.homemannerCount - 2,
            },
          },
        });
      }
      // 처음 누를때
      else if (matchResult.homemannerCount === 0) {
        await this.prisma.team.update({
          where: { id: hometeamId },
          data: {
            mannerRate: {
              set: hometeam.mannerRate - 1,
            },
          },
        });
        await this.prisma.matchResult.update({
          where: { id: matchResultId },
          data: {
            homemannerCount: {
              set: matchResult.homemannerCount - 1,
            },
          },
        });
      }
      matchResult = await this.findMatchResult(matchResultId);
      return matchResult;
    }
  }
}
