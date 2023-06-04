import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CreateMatchDto,
  EditMatchByAwayLeaderDto,
  EditMatchByHomeLeaderDto,
  ParticipateMatchDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Level, Team, User } from '@prisma/client';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  //공통 로직
  findTeam(userId: number) {
    return this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });
  }

  async renderMatchCreatePage(user: User) {
    const team = await this.findTeam(user.id);

    if (!team || team.leaderId !== user.id)
      throw new ForbiddenException(
        'renderMatchCreatePage Denied - Not a leader of any team',
      );

    const render_data = {
      matchLevel: Level[team.teamLevel],
      homeTeam: team.teamName,
      homeTeamLeader: user.userName,
      homeTeamMember: team.teamMember,
    };

    return render_data;
  }

  getMatchLevel(matchLevelBitMask: number) {
    const matchLevel: Level[] = [];

    if (matchLevelBitMask & (2 ** Object.values(Level).indexOf('BEGINNER')))
      matchLevel.push(Level.BEGINNER);
    if (matchLevelBitMask & (2 ** Object.values(Level).indexOf('INTERMEDIATE')))
      matchLevel.push(Level.INTERMEDIATE);
    if (matchLevelBitMask & (2 ** Object.values(Level).indexOf('ADVANCED')))
      matchLevel.push(Level.ADVANCED);

    return matchLevel;
  }

  //팀장이 매치 등록
  async createMatch(userId: number, dto: CreateMatchDto) {
    const homeTeam = await this.findTeam(userId);

    if (!homeTeam || homeTeam.leaderId !== userId)
      throw new ForbiddenException(
        'createMatch denied - Not a leader of any team',
      );

    const homeTeamParticipatingMember =
      dto.homeTeamParticipatingMemberString.split('/');

    const match = await this.prisma.match.create({
      data: {
        stadiumName: dto.stadiumName,
        stadiumAddress: dto.stadiumAddress,
        matchDateTime: dto.matchDateTime,
        matchLevel: this.getMatchLevel(dto.matchLevelBitMask),
        headCountPerTeam: dto.headCountPerTeam,
        homeTeamId: homeTeam.id,
        homeTeamLeaderId: homeTeam.leaderId,
        homeTeamParticipatingHeadCount: homeTeamParticipatingMember.length,
        homeTeamParticipatingMember: {
          set: homeTeamParticipatingMember,
        },
      },
    });

    return match;
  }

  //전체 매치 리스트 조회
  async getMatches() {
    const matches = await this.prisma.match.findMany();

    for (const match of matches) {
      const homeTeam = await this.prisma.team.findUnique({
        where: {
          id: match.homeTeamId,
        },
        select: {
          teamName: true,
        },
      });
      match['homeTeamName'] = homeTeam.teamName;

      if (match.awayTeamId !== null) {
        const awayTeam = await this.prisma.team.findUnique({
          where: {
            id: match.awayTeamId,
          },
          select: {
            teamName: true,
          },
        });
        match['awayTeamName'] = awayTeam.teamName;
      }
    }

    return {
      matches,
    };
  }

  //자신이 등록하거나 Away팀으로 참여한 매치 조회
  async getMyMatches(userId: number) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          {
            homeTeamLeaderId: userId,
          },
          {
            awayTeamLeaderId: userId,
          },
        ],
      },
    });

    for (const match of matches) {
      const homeTeam = await this.prisma.team.findUnique({
        where: {
          id: match.homeTeamId,
        },
        select: {
          teamName: true,
        },
      });
      match['homeTeamName'] = homeTeam.teamName;

      if (match.awayTeamId !== null) {
        const awayTeam = await this.prisma.team.findUnique({
          where: {
            id: match.awayTeamId,
          },
          select: {
            teamName: true,
          },
        });
        match['awayTeamName'] = awayTeam.teamName;
      }
    }

    return {
      matches,
    };
  }

  //특정 매치 조회
  async getMatchById(matchId: number) {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
      },
    });

    const homeTeam = await this.prisma.team.findUnique({
      where: {
        id: match.homeTeamId,
      },
    });

    let awayTeam: Team = null;
    if (match.awayTeamId !== null) {
      awayTeam = await this.prisma.team.findUnique({
        where: {
          id: match.awayTeamId,
        },
      });
    }

    const render_data = {
      ...match,
      homeTeamName: homeTeam.teamName,
    };

    if (awayTeam !== null) {
      render_data['awayTeamName'] = awayTeam.teamName;
    }

    return render_data;
  }

  async renderParticipantPage(user: User, matchId: number) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (
      !match ||
      match.homeTeamLeaderId === user.id ||
      match.awayTeamLeaderId !== null
    )
      throw new ForbiddenException(
        'renderParticipantPage Denied - Resource access denied',
      );

    const awayTeam = await this.prisma.team.findFirst({
      where: {
        leaderId: user.id,
      },
    });

    if (!awayTeam || awayTeam.leaderId !== user.id)
      throw new ForbiddenException(
        'renderParticipantPage Denied - Not a leader of any team',
      );

    if (!match.matchLevel.includes(awayTeam.teamLevel))
      throw new ForbiddenException(
        'renderParticipantPage Denied - Not a joinable awayTeam Level',
      );

    const render_date = {
      matchId: match.id,
      headCountPerTeam: match.headCountPerTeam,
      awayTeamMember: awayTeam.teamMember,
    };

    return render_date;
  }

  //Away팀의 참여 신청
  async participateAsAwayTeam(
    userId: number,
    matchId: number,
    dto: ParticipateMatchDto,
  ) {
    //matchId로 매치 가져오기
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    //match가 없거나, 이미 awayTeam이 등록된 경우
    if (!match || match.awayTeamId !== null)
      throw new ForbiddenException(
        'participateAsAwayTeam denied - Already closed match',
      );

    const team = await this.findTeam(userId);
    //팀이 없거나, home팀이 away팀으로 중복 참여하는 경우
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        'participateAsAwayTeam denied - Not a member of any team',
      );
    else if (team.id === match.homeTeamId)
      throw new ForbiddenException(
        'participateAsAwayTeam denied - Duplicate participation',
      );

    //MatchResult 모델 생성
    await this.prisma.matchResult.create({
      data: {
        matchId,
      },
    });

    const awayTeamParticipatingMember =
      dto.awayTeamParticipatingMemberString.split('/');

    return this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        awayTeamId: team.id,
        awayTeamLeaderId: userId,
        awayTeamParticipatingHeadCount: awayTeamParticipatingMember.length,
        awayTeamParticipatingMember: awayTeamParticipatingMember,
      },
    });
  }

  //매치를 등록한 팀장이 매치 수정(stadiumName, headCountPerTeam, homeTeamHeadCount, homeTeamMember)
  async editMatchAsHomeTeamById(
    userId: number,
    matchId: number,
    dto: EditMatchByHomeLeaderDto,
  ) {
    //matchId로 매치 가져오기
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    //매치가 있는지와 userId와 homeTeamLeadId가 일치하는지 확인
    if (!match || match.homeTeamLeaderId !== userId)
      throw new ForbiddenException('Access to resources denied');

    //매치 내용 업데이트
    return this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        ...dto,
      },
    });
  }

  //Away팀으로 참여한 팀장이 매치 수정(awayTeamHeadCount, awayTeamMember)
  async editMatchAsAwayTeamById(
    userId: number,
    matchId: number,
    dto: EditMatchByAwayLeaderDto,
  ) {
    //matchId로 매치 가져오기
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    //매치가 있는지와 userId와 homeTeamLeadId가 일치하는지 확인
    if (!match || match.awayTeamLeaderId !== userId)
      throw new ForbiddenException('Access to resources denied!');

    //매치 내용 업데이트
    return this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        ...dto,
      },
    });
  }

  //Away팀으로 참여한 팀장이 매치 취소
  async cancelMatchAsAwayTeamById(userId: number, matchId: number) {
    //matchId로 매치 가져오기
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    //매치가 있는지와 userId와 homeTeamLeadId가 일치하는지 확인
    if (!match || match.awayTeamLeaderId !== userId)
      throw new ForbiddenException('Access to resources denied');

    //매치 내용 업데이트
    const matchResult = await this.prisma.matchResult.findFirst({
      where: {
        matchId: matchId,
      },
    });

    await this.prisma.matchResult.delete({
      where: {
        id: matchResult.id,
      },
    });

    await this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        awayTeamId: null,
        awayTeamLeaderId: null,
        awayTeamParticipatingHeadCount: null,
        awayTeamParticipatingMember: [],
      },
    });
  }

  //매치를 등록한 팀장이 매치 삭제
  async deleteMatchById(userId: number, matchId: number) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    //매치가 있는지와 userId와 homeTeamLeadId가 일치하는지 확인
    if (!match || match.homeTeamLeaderId !== userId)
      throw new ForbiddenException('Access to resources denied');

    //매치 내용 업데이트
    return this.prisma.match.delete({
      where: {
        id: matchId,
      },
    });
  }
}
