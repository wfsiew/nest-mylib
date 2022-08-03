import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { User } from 'src/models/model';
import { UserService } from 'src/services/user/user.service';

export interface RefreshTokenPayload {
  jti: number;
  sub: number;
}

@Injectable()
export class TokenService {

  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const opts: SignOptions = {
      subject: String(user.id)
    }
    return this.jwt.signAsync({}, opts);
  }

  async generateRefreshToken(user: User, expiresIn: number): Promise<string> {
    const opts: SignOptions = {
      expiresIn: expiresIn,
      subject: String(user.id),
      jwtid: String(user.id)
    }
    return this.jwt.signAsync({}, opts);
  }

  async resolveRefreshToken(encoded: string): Promise<{ user: User, token: number }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  async createAccessTokenFromRefreshToken(refresh: string): Promise<{ token: string, user: User }> {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<User> {
    const subId = payload.sub;

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.userService.findById(subId);
  }

  private async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload) {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return tokenId;
  }
}
