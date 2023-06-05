import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('map')
export class MapController {
  constructor(private mapService: MapService) {}

  @Get()
  @Render('map/stadium')
  renderMapPage(@GetUser('id') userId: number) {
    return this.mapService.renderMapPage(userId);
  }
}
