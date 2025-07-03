import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: false,
  });
  await app.listen(process.env.PORT ?? 3001);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
