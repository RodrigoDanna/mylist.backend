import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

describe('main.ts bootstrap', () => {
  let createMock: jest.SpyInstance;
  let listenMock: jest.Mock;
  let enableCorsMock: jest.Mock;

  beforeAll(() => {
    listenMock = jest.fn();
    enableCorsMock = jest.fn();
    const mockApp: Partial<import('@nestjs/common').INestApplication> = {
      enableCors: enableCorsMock,
      listen: listenMock,
    };
    createMock = jest
      .spyOn(NestFactory, 'create')
      .mockResolvedValue(mockApp as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should bootstrap the app without errors', async () => {
    const main = await import('./main');
    await main.bootstrap();
    expect(createMock).toHaveBeenCalledWith(AppModule);
    expect(enableCorsMock).toHaveBeenCalledWith({
      origin: 'http://localhost:3000',
      credentials: false,
    });
    expect(listenMock).toHaveBeenCalled();
  });
});
