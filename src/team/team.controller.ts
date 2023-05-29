import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { TeamService } from './team.service';
import { GetUser } from '../auth/decorator';
import { CreateTeamDto, EditTeamDto } from './dto';

@UseGuards(JwtGuard)
@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  //팀장이 팀 등록
  @Post()
  createTeam(@GetUser('id') userId: number, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(userId, dto);
  }

  //전체 팀 리스트 조회
  @Get()
  getTeams() {
    return this.teamService.getTeams();
  }

  //자신이 속한 팀 조회
  @Get('my')
  getMyTeams(@GetUser('id') userId: number) {
    return this.teamService.getMyTeams(userId);
  }

  //특정 팀 조회
  @Get(':id')
  getTeamById(@Param('id', ParseIntPipe) teamId: number) {
    return this.teamService.getTeamById(teamId);
  }

  //팀장이 팀 수정
  @Patch(':id')
  editTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
    @Body() dto: EditTeamDto,
  ) {
    return this.teamService.editTeamById(userId, teamId, dto);
  }

  //팀장이 팀 삭제
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
  ) {
    return this.teamService.deleteTeamById(userId, teamId);
  }
}
