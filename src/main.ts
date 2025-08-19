// import xss from 'xss-clean';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3001;
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  // app.use(xss());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(PORT);
  console.log('Server running on port', PORT);
}

bootstrap();
