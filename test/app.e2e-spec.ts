import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SigninDto, SignupDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateTeamDto, EditTeamDto } from '../src/team/dto';
import { Level } from '@prisma/client';

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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.userName);
      });
    });
  });

  describe('Team', () => {
    describe('Get empty teams', () => {
      it('should get teams', () => {
        return pactum
          .spec()
          .get('/teams')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectBodyContains('$S{teamId}');
      });
    });

    describe('Get My teams', () => {
      it('should get team by id', () => {
        return pactum
          .spec()
          .get('/teams/my')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
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
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(204);
      });

      it('should get empty team', () => {
        return pactum
          .spec()
          .get('/teams')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });

  describe('Match', () => {
    describe('Create match', () => {});

    describe('Get matches', () => {});

    describe('Get match by id', () => {});

    describe('Get My matches', () => {});

    describe('Edit match', () => {});

    describe('Delete match', () => {});
  });
});
