import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppConstant } from './constants/app.constant';
import { TOKEN_NAME } from './constants/auth.constant';
import { ErrorFilter } from './utils/error.filter';
import { TransformInterceptor } from './utils/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ 
    logger: {
      level: 'error'
    }
  }));
  app.setGlobalPrefix('/lib');
  app.enableCors({
    exposedHeaders: ['Authorization', 'filename', AppConstant.X_TOTAL_COUNT, AppConstant.X_TOTAL_PAGE]
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Lib')
    .setDescription('Lib API description')
    .setVersion('1.0')
    .addTag('lib')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Access token',
        in: 'header',
      },
      TOKEN_NAME,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const server = await app.listen('8000', '0.0.0.0');
  server.setTimeout(600000); // 10 min
}
bootstrap();
