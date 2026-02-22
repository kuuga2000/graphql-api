import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns an empty user list', async () => {
    const query = `
      query {
        users {
          id
          name
          email
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toEqual({ users: [] });
  });

  it('creates a user and returns it from users query', async () => {
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const variables = {
      input: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      },
    };

    const mutationResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation, variables })
      .expect(200);

    expect(mutationResponse.body.errors).toBeUndefined();
    expect(mutationResponse.body.data.createUser).toEqual({
      id: '1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });

    const query = `
      query {
        users {
          id
          name
          email
        }
      }
    `;

    const queryResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(queryResponse.body.errors).toBeUndefined();
    expect(queryResponse.body.data.users).toEqual([
      { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
    ]);
  });
});
