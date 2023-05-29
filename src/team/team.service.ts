import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTeamDto, EditTeamDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async createTeam(userId: number, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        leaderId: userId,
        teamMember: [userId.toString()],
        ...dto,
      },
    });

    return team;
  }

  getTeams() {
    return this.prisma.team.findMany({});
  }

  getTeamById(teamId: number) {
    return this.prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });
  }

  getMyTeams(userId: number) {
    return this.prisma.team.findMany({
      where: {
        leaderId: userId,
      },
    });
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

    return this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        ...dto,
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
