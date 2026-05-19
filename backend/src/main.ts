import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Socket.io WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS — izinkan frontend Next.js di port 3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe: tolak field yang tidak terdaftar di DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('Game Session Manager API')
    .setDescription('Multiplayer game lobby & session backend')
    .setVersion('1.0')
    .addTag('sessions', 'Game session lifecycle')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
  console.log('Swagger docs at  http://localhost:3001/api/docs');
}

bootstrap();
