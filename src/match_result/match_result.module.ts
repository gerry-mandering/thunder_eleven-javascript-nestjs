import { Module } from '@nestjs/common';
import { MatchResultController } from './match_result.controller';
import { MatchResultService } from './match_result.service';

@Module({
  controllers: [MatchResultController],
  providers: [MatchResultService],
})
export class MatchResultModule {}
