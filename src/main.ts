import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*', // O especifica: ['http://127.0.0.1:5500']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Range',
    exposedHeaders: 'Content-Range, Content-Length',
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // elimina campos no definidos en DTO
      forbidNonWhitelisted: true, // lanza error si mandan propiedades extra
      transform: true,          // convierte payloads a instancias de DTO
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Media Streaming Service')
    .setDescription('API for video upload and streaming')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
