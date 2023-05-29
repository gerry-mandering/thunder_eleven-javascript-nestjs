import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CreateMatchDto,
  EditMatchByAwayLeaderDto,
  EditMatchByHomeLeaderDto,
  ParticipateMatchDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';

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

  //팀장이 매치 등록
  async createMatch(userId: number, dto: CreateMatchDto) {
    const team = await this.findTeam(userId);

    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        'createMatch denied - Not a member of any team',
      );

    const match = await this.prisma.match.create({
      data: {
        userId,
        matchLevel: team.teamLevel,
        homeTeamId: team.id,
        homeTeamLeaderId: userId,
        stadiumName: dto.stadiumName,
        headCountPerTeam: dto.headCountPerTeam,
        homeTeamParticipatingMember: {
          set: dto.homeTeamParticipatingMember,
        },
      },
    });

    return match;
  }

  //전체 매치 리스트 조회
  getMatches() {
    return this.prisma.match.findMany();
  }

  //자신이 등록하거나 Away팀으로 참여한 매치 조회
  getMyMatches(userId: number) {
    return this.prisma.match.findMany({
      where: {
        OR: [
          {
            homeTeamId: userId,
          },
          {
            awayTeamId: userId,
          },
        ],
      },
    });
  }

  //특정 매치 조회
  getMatchById(matchId: number) {
    return this.prisma.match.findFirst({
      where: {
        id: matchId,
      },
    });
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

    return this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        awayTeamId: team.id,
        awayTeamLeaderId: userId,
        ...dto,
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
    return this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        awayTeamId: null,
        awayTeamLeaderId: null,
        awayTeamParticipatingMember: null,
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
