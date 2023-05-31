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
  Render,
  UseGuards,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { GetUser } from '../auth/decorator';
import { CreateMatchDto, EditMatchByAwayLeaderDto, EditMatchByHomeLeaderDto, ParticipateMatchDto } from "./dto";
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('matches')
export class MatchController {
  constructor(private matchService: MatchService) {}

  //팀장이 매치 등록
  @Post()
  createMatch(@GetUser('id') userId: number, @Body() dto: CreateMatchDto) {
    return this.matchService.createMatch(userId, dto);
  }

  //전체 매치 리스트 조회
  @Get()
  getMatches() {
    return this.matchService.getMatches();
  }

  //자신이 등록하거나 Away팀으로 참여한 매치 조회
  @Get('my')
  getMyMatches(@GetUser('id') userId: number) {
    return this.matchService.getMyMatches(userId);
  }

  //특정 매치 조회
  @Get(':id')
  getMatchById(@Param('id', ParseIntPipe) matchId: number) {
    return this.matchService.getMatchById(matchId);
  }

  //Away팀의 참여페이지
  @Get(':id/participant')
  @Render('participant')
  showParticipatePage(@Param('id', ParseIntPipe) matchId: number) {
    return { matchId };
    //:id/participant에 Post 요청하도록 hbs파일 수정
  }

  //Away팀의 참여 신청
  @Post(':id/participant')
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
  cancelMatchAsAwayTeamById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
  ) {
    return this.matchService.cancelMatchAsAwayTeamById(userId, matchId);
  }

  //매치를 등록한 팀장이 매치 삭제
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteMatchById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchId: number,
  ) {
    return this.matchService.deleteMatchById(userId, matchId);
  }
}
