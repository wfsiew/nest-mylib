import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DbService } from 'src/services/db/db.service';
import { UserService } from 'src/services/user/user.service';
import { TokenService } from 'src/services/token/token.service';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { AppConstant } from 'src/constants/app.constant';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
      PassportModule,
      JwtModule.register({
        secret: AppConstant.JWT_SECRET,
        signOptions: {
          expiresIn: '5d'
        }
      }),
    ],
    controllers: [AuthController],
    providers: [DbService, UserService, TokenService, JwtStrategy]
  })
export class AuthModule {}
