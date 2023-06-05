import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';

@Module({
  providers: [MapService],
  controllers: [MapController]
})
export class MapModule {}
