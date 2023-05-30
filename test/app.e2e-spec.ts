import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SigninDto, SignupDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateTeamDto, EditTeamDto } from '../src/team/dto';
import { Level } from '@prisma/client';
import {
  CreateMatchDto,
  EditMatchByAwayLeaderDto,
  EditMatchByHomeLeaderDto,
  ParticipateMatchDto,
} from '../src/match/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw if email empty', () => {
        const dto: SignupDto = {
          email: 'minseok@gmail.com',
          password: '123',
          userName: 'minseok',
        };
        delete dto.email;

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('should signup', () => {
        const dto: SignupDto = {
          email: 'minseok@gmail.com',
          password: '123',
          userName: 'minseok',
        };

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should signin', () => {
        const dto: SigninDto = {
          email: 'minseok@gmail.com',
          password: '123',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          email: 'kim@gmail.com',
          userName: 'kim',
        };
        return pactum
          .spec()
          .patch('/users')
          .withCookies('jwt', '$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.userName);
      });
    });
  });

  describe('Team', () => {
    describe('Get empty teams', () => {
      it('should get empty teams', () => {
        return pactum
          .spec()
          .get('/teams')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create team', () => {
      const dto: CreateTeamDto = {
        teamName: 'First Team',
        region: 'Seoul',
      };
      it('should create team', () => {
        return pactum
          .spec()
          .post('/teams')
          .withCookies('jwt', '$S{userAt}')
          .withBody(dto)
          .expectStatus(201)
          .stores('teamId', 'id');
      });
    });

    describe('Get teams', () => {
      it('should get teams', () => {
        return pactum
          .spec()
          .get('/teams')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get team by id', () => {
      it('should get team by id', () => {
        return pactum
          .spec()
          .get('/teams/{id}')
          .withPathParams('id', '$S{teamId}')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectBodyContains('$S{teamId}');
      });
    });

    describe('Get My teams', () => {
      it('should get team by id', () => {
        return pactum
          .spec()
          .get('/teams/my')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200);
      });
    });

    describe('Edit team by id', () => {
      const dto: EditTeamDto = {
        teamName: 'Team Team',
        teamLevel: Level.ADVANCED,
      };
      it('should edit team by id', () => {
        return pactum
          .spec()
          .patch('/teams/{id}')
          .withPathParams('id', '$S{teamId}')
          .withCookies('jwt', '$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.teamName)
          .expectBodyContains(dto.teamLevel);
      });
    });

    describe('Delete team', () => {
      it('should delete team by id', () => {
        return pactum
          .spec()
          .delete('/teams/{id}')
          .withPathParams('id', '$S{teamId}')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(204);
      });

      it('should get empty team', () => {
        return pactum
          .spec()
          .get('/teams')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200);
      });
    });
  });

  describe('Match', () => {
    describe('Get empty match', () => {
      it('should get empty matches', () => {
        return pactum
          .spec()
          .get('/matches')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    const createMatchDto: CreateMatchDto = {
      stadiumName: '상암 월드컵 경기장',
      headCountPerTeam: 6,
      homeTeamParticipatingMember: ['김민석', '김기섭', '박영동', '이상민'],
    };

    describe('Create match', () => {
      beforeAll(() => {
        const createTeamDto: CreateTeamDto = {
          teamName: 'First Team',
          region: 'Seoul',
        };
        return pactum
          .spec()
          .post('/teams')
          .withCookies('jwt', '$S{userAt}')
          .withBody(createTeamDto)
          .expectStatus(201)
          .stores('teamId', 'id');
      });

      it('should create match', () => {
        return pactum
          .spec()
          .post('/matches')
          .withCookies('jwt', '$S{userAt}')
          .withBody(createMatchDto)
          .expectStatus(201)
          .expectBodyContains(createMatchDto.stadiumName)
          .expectBodyContains(createMatchDto.headCountPerTeam)
          .expectBodyContains(createMatchDto.homeTeamParticipatingMember)
          .stores('matchId', 'id');
      });
    });

    describe('Get matches', () => {
      it('should get match', () => {
        return pactum
          .spec()
          .get('/matches')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get my matches', () => {
      it('should get my matches', () => {
        return pactum
          .spec()
          .get('/matches/my')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200);
      });
    });

    describe('Get match by id', () => {
      it('should get match by id', () => {
        return pactum
          .spec()
          .get('/matches/$S{matchId}')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(200)
          .expectBodyContains(createMatchDto.stadiumName)
          .expectBodyContains(createMatchDto.headCountPerTeam)
          .expectBodyContains(createMatchDto.homeTeamParticipatingMember);
      });
    });

    describe('AwayTeam Participate in a Match', () => {
      beforeAll(async () => {
        const signupDto: SignupDto = {
          email: 'participant@gmail.com',
          password: '123',
          userName: 'participant',
        };
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201)
          .stores('participantJwt', 'access_token');

        const createTeamDto: CreateTeamDto = {
          teamName: 'Second Team',
          region: 'Seoul',
        };
        return pactum
          .spec()
          .post('/teams')
          .withCookies('jwt', '$S{participantJwt}')
          .withBody(createTeamDto)
          .expectStatus(201);
      });

      const participateMatchDto: ParticipateMatchDto = {
        awayTeamParticipatingMember: [
          '참가자1',
          '참가자2',
          '참가자3',
          '참가자4',
        ],
      };
      it('should awayTeam participate in a match', () => {
        return pactum
          .spec()
          .post('/matches/{id}/participant')
          .withPathParams('id', '$S{matchId}')
          .withCookies('jwt', '$S{participantJwt}')
          .withBody(participateMatchDto)
          .expectStatus(201);
      });
    });

    describe('Edit Match As HomeTeam Leader', () => {
      const editMatchByHomeLeaderDto: EditMatchByHomeLeaderDto = {
        stadiumName: 'Suwon Park',
        headCountPerTeam: 5,
        // homeTeamParticipatingMember: ['123'],
      };
      it('should edit match as homeTeam leader by id', () => {
        return pactum
          .spec()
          .patch('/matches/{id}/home')
          .withPathParams('id', '$S{matchId}')
          .withCookies('jwt', '$S{userAt}')
          .withBody(editMatchByHomeLeaderDto)
          .expectStatus(200)
          .expectBodyContains(editMatchByHomeLeaderDto.stadiumName)
          .expectBodyContains(editMatchByHomeLeaderDto.headCountPerTeam);
      });
    });

    describe('Edit Match As AwayTeam Leader', () => {
      const editMatchByAwayLeaderDto: EditMatchByAwayLeaderDto = {
        awayTeamParticipatingMember: ['참가자1', '참가자2', '참가자3'],
      };
      it('should edit match as awayTeam leader by id', () => {
        return pactum
          .spec()
          .patch('/matches/{id}/away')
          .withPathParams('id', '$S{matchId}')
          .withCookies('jwt', '$S{participantJwt}')
          .withBody(editMatchByAwayLeaderDto)
          .expectStatus(200)
          .expectBodyContains(
            editMatchByAwayLeaderDto.awayTeamParticipatingMember,
          )
          .inspect();
      });
    });

    describe('Cancel Match As AwayTeam Leader', () => {
      it('should cancel match as awayTeam leader by id', () => {
        return pactum
          .spec()
          .patch('/matches/{id}/cancellation')
          .withPathParams('id', '$S{matchId}')
          .withCookies('jwt', '$S{participantJwt}')
          .expectStatus(200);
      });
    });

    describe('Delete match', () => {
      it('should delete match as homeTeam leader by id', () => {
        return pactum
          .spec()
          .delete('/matches/{id}')
          .withPathParams('id', '$S{matchId}')
          .withCookies('jwt', '$S{userAt}')
          .expectStatus(204);
      });
    });
  });
});
