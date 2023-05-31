// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   ParseIntPipe,
//   Patch,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import { MatchResultService } from './match_result.service';
// import { JwtGuard } from '../auth/guard';
// import { GetUser } from '../auth/decorator';
//
// @UseGuards(JwtGuard)
// @Controller('match-result')
// export class MatchResultController {
//   constructor(private matchresultService: MatchResultService) {}
//
//   @Get()
//   getResult() {
//     return this.matchresultService.getResult();
//   }
//
//   @Post('/mannerup/:matchresultid')
//   mannerUp(
//     @GetUser('id') userId: number,
//     @Param('matchresultid') matchResultId: number,
//   ) {
//     return this.matchresultService.mannerUp(userId, matchResultId);
//   }
// }
