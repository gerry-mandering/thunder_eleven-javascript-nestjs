import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateTeamDto, EditTeamDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // 팀 생성 페이지 렌더링
  renderTeamCreatePage(user: User) {
    return {
      leaderName: user.userName,
    };
  }

  // 팀 생성
  async createTeam(userId: number, dto: CreateTeamDto) {
    // DB에서 유저가 속한 팀 가져오기
    const team = await this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });

    // 유저의 팀이 이미 존재하면 예외 던지기
    if (team)
      throw new ForbiddenException(
        `CreateTeam Denied - Already Leader of Team : ${team.teamName}`,
      );

    // 팀 멤버들의 이름 문자열 배열로 변환
    const teamMember = dto.teamMemberString.split('/');

    // 팀 생성
    return this.prisma.team.create({
      data: {
        teamName: dto.teamName,
        region: dto.region,
        headCount: teamMember.length,
        leaderId: userId,
        teamMember: {
          set: teamMember,
        },
      },
    });
  }

  // 전체 팀 목록 조회
  async getTeams() {
    // DB에서 전체 팀 가져오기
    const teams = await this.prisma.team.findMany({});

    // teams를 순회하면서 리더의 이름 leaderName 필드에 저장
    for (const team of teams) {
      const leader = await this.prisma.user.findUnique({
        where: {
          id: team.leaderId,
        },
      });
      team['leaderName'] = leader.userName;
    }

    // 전체 팀 반환
    return {
      teams,
    };
  }

  // 유저가 속한 팀 조회
  async getMyTeam(userId: number) {
    // DB에서 유저가 속한 팀 가져오기
    const team = await this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });

    // 유저의 팀이 존재하지 않을 경우 예외 던지기
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        'getMyTeam Denied - Not a member of any team',
      );

    // 팀 리더 조회
    const leader = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // 리더의 이름 leaderName 필드에 저장
    team['leaderName'] = leader.userName;

    // 팀 정보 반환
    return team;
  }

  // 특정 팀 조회
  async getTeamById(teamId: number) {
    // DB에서 특정 팀 가져오기
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    // 팀 리더 조회
    const leader = await this.prisma.user.findUnique({
      where: {
        id: team.leaderId,
      },
    });

    // 리더의 이름 leaderName 필드에 저장
    team['leaderName'] = leader.userName;

    // 팀 정보 반환
    return team;
  }

  // 팀 수정 페이지 렌더링
  async renderTeamEditPage(userId: number, teamId: number) {
    // DB에서 유저가 속한 팀 가져오기
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    // 유저가 팀의 리더가 아닐 경우 예외 던지기
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        `renderTeamEditPage Denied - Not a leader of team : ${team.teamName}`,
      );

    // 팀 정보 반환
    return team;
  }

  // 팀 수정
  async editTeamById(userId: number, teamId: number, dto: EditTeamDto) {
    // DB에서 유저가 속한 팀 가져오기
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // 유저가 팀의 리더가 아닐 경우 예외 던지기
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        `editTeamById Denied - Not a leader of team : ${team.teamName}`,
      );

    // 팀 멤버들의 이름 문자열 배열로 변환
    const teamMember = dto.teamMemberString.split('/');

    // 팀 정보 갱신
    return this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        teamName: dto.teamName,
        region: dto.region,
        headCount: teamMember.length,
        teamMember: {
          set: teamMember,
        },
      },
    });
  }

  // 팀 삭제
  async deleteTeamById(userId: number, teamId: number) {
    // DB에서 특정 팀 가져오기
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // 유저가 팀의 리더가 아닐 경우 예외 던지기
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        `deleteTeamById Denied - Not a leader of team : ${team.teamName}`,
      );

    // DB에서 특정 팀 삭제
    await this.prisma.team.delete({
      where: {
        id: teamId,
      },
    });
  }
}
