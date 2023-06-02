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
  Redirect,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { TeamService } from './team.service';
import { GetUser } from '../auth/decorator';
import { CreateTeamDto, EditTeamDto } from './dto';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  //팀 등록 페이지 정적 렌더링
  @Get('create')
  @Render('team/create')
  renderTeamCreatePage(@GetUser() user: User) {
    return this.teamService.renderTeamCreatePage(user);
  }

  //팀장이 팀 등록
  @Post('create')
  @Redirect('/team/my')
  createTeam(@GetUser('id') userId: number, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(userId, dto);
  }

  //전체 팀 리스트 조회
  @Get()
  @Render('team/list')
  getTeams() {
    return this.teamService.getTeams();
  }

  //자신이 속한 팀 조회
  @Get('my')
  @Render('team/info')
  getMyTeam(@GetUser('id') userId: number) {
    return this.teamService.getMyTeam(userId);
  }

  //특정 팀 조회
  @Get(':id')
  @Render('team/info')
  getTeamById(@Param('id', ParseIntPipe) teamId: number) {
    return this.teamService.getTeamById(teamId);
  }

  //팀 수정 페이지 정적 렌더링
  @Get(':id/edit')
  @Render('team/edit')
  renderTeamEditPage(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
  ) {
    return this.teamService.renderTeamEditPage(userId, teamId);
  }

  //팀장이 팀 수정
  @Patch(':id/edit')
  @Redirect('../my')
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
  @Redirect('/')
  deleteTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
  ) {
    return this.teamService.deleteTeamById(userId, teamId);
  }
}
