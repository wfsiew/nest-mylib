import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppConstant } from 'src/constants/app.constant';
import { UserService } from 'src/services/user/user.service';

export interface AccessTokenPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AppConstant.JWT_SECRET,
      signOptions: {
        expiresIn: '5d'
      },
    });
  }

  async validate(payload: AccessTokenPayload): Promise<any> | null {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      return null;
    }

    return { id: user.id, username: user.username };
  }
}