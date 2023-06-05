import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { TeamModule } from './team/team.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
// import { MatchResultModule } from './match_result/match_result.module';
import { MapModule } from './map/map.module';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    MatchModule,
    TeamModule,
    PrismaModule,
    MapModule,
    // MatchResultModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
    consumer
      .apply(methodOverride('_method'))
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
