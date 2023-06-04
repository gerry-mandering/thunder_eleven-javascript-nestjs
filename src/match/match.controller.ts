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
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { GetUser } from '../auth/decorator';
import {
  CreateMatchDto,
  EditMatchByAwayLeaderDto,
  EditMatchByHomeLeaderDto,
  ParticipateMatchDto,
} from './dto';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}

  //매치 생성 페이지 정적 렌더링
  @Get('create')
  @Render('match/create')
  renderMatchCreatePage(@GetUser() user: User) {
    return this.matchService.renderMatchCreatePage(user);
  }

  //팀장이 매치 등록
  @Post('create')
  @Redirect('/match')
  createMatch(@GetUser('id') userId: number, @Body() dto: CreateMatchDto) {
    return this.matchService.createMatch(userId, dto);
  }

  //전체 매치 리스트 조회
  @Get()
  @Render('match/list')
  getMatches() {
    return this.matchService.getMatches();
  }

  //자신이 등록하거나 Away팀으로 참여한 매치 조회
  @Get('my')
  @Render('match/list')
  getMyMatches(@GetUser('id') userId: number) {
    return this.matchService.getMyMatches(userId);
  }

  //특정 매치 조회
  @Get(':id')
  @Render('match/info.hbs')
  getMatchById(@Param('id', ParseIntPipe) matchId: number) {
    return this.matchService.getMatchById(matchId);
  }

  //Away팀의 참여페이지
  @Get(':id/participant')
  @Render('match/participate')
  renderParticipatePage(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) matchId: number,
  ) {
    return this.matchService.renderParticipantPage(user, matchId);
  }

  //Away팀의 참여 신청
  @Post(':id/participant')
  @Redirect('/match')
  participateAsAwayTeam(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
    @Body() dto: ParticipateMatchDto,
  ) {
    return this.matchService.participateAsAwayTeam(userId, matchId, dto);
  }

  //매치를 등록한 팀장이 매치 수정(stadiumName, headCountPerTeam, homeTeamMember)
  @Patch(':id/home')
  editMatchAsHomeTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
    @Body() dto: EditMatchByHomeLeaderDto,
  ) {
    return this.matchService.editMatchAsHomeTeamById(userId, matchId, dto);
  }

  //Away팀으로 참여한 팀장이 매치 수정(awayTeamHeadCount, awayTeamMember)
  @Patch(':id/away')
  editMatchAsAwayTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
    @Body() dto: EditMatchByAwayLeaderDto,
  ) {
    return this.matchService.editMatchAsAwayTeamById(userId, matchId, dto);
  }

  //Away팀으로 참여한 팀장이 매치 취소
  @Patch(':id/cancel')
  @Redirect('/match')
  cancelMatchAsAwayTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
  ) {
    return this.matchService.cancelMatchAsAwayTeamById(userId, matchId);
  }

  //매치를 등록한 팀장이 매치 삭제
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Redirect('/match')
  deleteMatchById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
  ) {
    return this.matchService.deleteMatchById(userId, matchId);
  }
}
