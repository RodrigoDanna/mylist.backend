import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtModule } from '@nestjs/jwt';

describe('JwtModule config', () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    process.env = { ...OLD_ENV };
    jest.resetModules();
  });

  it('should use JWT_SECRET from environment variable', async () => {
    process.env.JWT_SECRET = 'testsecret';
    jest.resetModules();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET || 'mysecret',
          signOptions: { expiresIn: '1y' },
        }),
      ],
    }).compile();
    const jwtService = moduleRef.get(JwtService);
    const token = jwtService.sign({ foo: 'bar' });
    expect(typeof token).toBe('string');
  });
});
