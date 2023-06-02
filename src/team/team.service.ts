import {
  ForbiddenException,
  Injectable,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateTeamDto, EditTeamDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  renderTeamCreatePage(user: User) {
    return {
      leaderName: user.userName,
    };
  }

  async createTeam(userId: number, dto: CreateTeamDto) {
    //현재 유저의 팀이 존재하는지 확인
    const team = await this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });

    if (team)
      throw new ForbiddenException(
        `CreateTeam Denied - Already Leader of Team : ${team.teamName}`,
      );

    const teamMember = dto.teamMemberString.split('/');

    return this.prisma.team.create({
      data: {
        teamName: dto.teamName,
        region: dto.region,
        leaderId: userId,
        teamMember: {
          set: teamMember,
        },
        headCount: teamMember.length,
      },
    });
  }

  async getTeams() {
    const teams = await this.prisma.team.findMany({});

    //임시로 userName key 추가해서 반환
    for (const team of teams) {
      const leader = await this.prisma.user.findUnique({
        where: {
          id: team.leaderId,
        },
      });
      team['leaderName'] = leader.userName;
    }

    return {
      teams,
    };
  }

  async getMyTeam(userId: number) {
    const myTeam = await this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });

    if (!myTeam)
      throw new ForbiddenException(
        'getMyTeam Denied - Not a member of any team',
      );

    const leader = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return {
      teamId: myTeam.id,
      teamName: myTeam.teamName,
      region: myTeam.region,
      teamLevel: myTeam.teamLevel,
      mannerRate: myTeam.mannerRate,
      mannerCount: myTeam.mannerCount,
      headCount: myTeam.headCount,
      teamLeader: leader.userName,
      teamMember: myTeam.teamMember,
    };
  }

  async getTeamById(teamId: number) {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    const leader = await this.prisma.user.findUnique({
      where: {
        id: team.leaderId,
      },
    });

    return {
      teamId: team.id,
      teamName: team.teamName,
      region: team.region,
      teamLevel: team.teamLevel,
      mannerRate: team.mannerRate,
      mannerCount: team.mannerCount,
      headCount: team.headCount,
      teamLeader: leader.userName,
      teamMember: team.teamMember,
    };
  }

  async renderTeamEditPage(userId: number, teamId: number) {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        `renderTeamEditPage Denied - Not a leader of team : ${team.teamName}`,
      );

    return {
      teamId: team.id,
      teamName: team.teamName,
      region: team.region,
      teamLevel: team.teamLevel,
      mannerRate: team.mannerRate,
      mannerCount: team.mannerCount,
      headCount: team.headCount,
      teamMember: team.teamMember,
    };
  }

  async editTeamById(userId: number, teamId: number, dto: EditTeamDto) {
    // get the team by id
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // check if user is leader of the team
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException('Access to resources denied');

    const teamMember = dto.teamMemberString.split('/');

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

  async deleteTeamById(userId: number, teamId: number) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // check if user is leader of the team
    if (!team || team.leaderId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.team.delete({
      where: {
        id: teamId,
      },
    });
  }
}
