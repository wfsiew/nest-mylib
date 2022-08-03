import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbService } from './services/db/db.service';
import { UserService } from './services/user/user.service';
import { BookService } from './services/book/book.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';
import { WinstonModule } from 'nest-winston';
import { UserController } from './controllers/user/user.controller';
import { RoleService } from './services/role/role.service';
import { BookController } from './controllers/book/book.controller';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      // options
      level: 'error',
      exitOnError: false,
      format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
      transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' })
      ]
    }),
    AuthModule
  ],
  controllers: [AppController, UserController, BookController],
  providers: [AppService, DbService, UserService, BookService, RoleService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
  ],
})
export class AppModule {}
