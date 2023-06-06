import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Redirect,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MatchResultService } from './match_result.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { EditMatchResultdto } from './dto';
import { EditCommentdto } from './dto/edit-commentdto';
import { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('match-result')
export class MatchResultController {
  constructor(private matchresultService: MatchResultService) {}

  @Get()
  @Render('match_result/list')
  getMatchResults() {
    return this.matchresultService.getMatchResults();
  }

  @Get(':id')
  @Render('match_result/info')
  renderMatchResultPage(@Param('id', ParseIntPipe) matchResultId: number) {
    return this.matchresultService.renderMatchResultPage(matchResultId);
  }

  @Get(':id/score')
  @Render('match_result/score')
  renderEditScorePage(@Param('id', ParseIntPipe) matchResultId: number) {
    return this.matchresultService.renderEditScorePage(matchResultId);
  }

  @Patch(':id/score')
  @Redirect('/match-result')
  editScore(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchResultId: number,
    @Body() dto: EditMatchResultdto,
  ) {
    return this.matchresultService.editScore(userId, matchResultId, dto);
  }

  @Post(':id/comment')
  async createComment(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchResultId: number,
    @Body() dto: EditCommentdto,
    @Res() response: Response,
  ) {
    await this.matchresultService.createComment(userId, matchResultId, dto);
    response.redirect(`/match-result/${matchResultId}`);
  }

  @Patch('/:id/comment/:commentId')
  editcomment(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) matchResultId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: EditCommentdto,
  ) {
    return this.matchresultService.editComment(
      userId,
      matchResultId,
      dto,
      commentId,
    );
  }

  @Post('/mannerup/:matchresultid/:matchid')
  async mannerUp(
    @GetUser('id') userId: number,
    @Param('matchresultid', ParseIntPipe) matchResultId: number,
    @Param('matchid', ParseIntPipe) matchid: number,
    @Res() response: Response,
  ) {
    await this.matchresultService.mannerUp(userId, matchResultId, matchid);
    response.redirect(`/match-result/${matchResultId}`);
  }

  @Post('/mannerdown/:matchresultid/:matchid')
  async mannerDown(
    @GetUser('id') userId: number,
    @Param('matchresultid', ParseIntPipe) matchResultId: number,
    @Param('matchid', ParseIntPipe) matchid: number,
    @Res() response: Response,
  ) {
    await this.matchresultService.mannerDown(userId, matchResultId, matchid);
    response.redirect(`/match-result/${matchResultId}`);
  }
}
