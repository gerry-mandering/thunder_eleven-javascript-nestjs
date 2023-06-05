import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapService {
  constructor(private prisma: PrismaService) {}

  async renderMapPage(userId: number) {
    const team = await this.prisma.team.findFirst({
      where: {
        leaderId: userId,
      },
    });

    if (!team || team.leaderId !== userId)
      throw new ForbiddenException(
        'renderMapPage Denied - Not a leader of any team',
      );

    const render_data = {
      region: team.region,
    };

    return render_data;
  }
}
