import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Inject, Logger, NotFoundException, Post, Req, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { SkipAuth } from 'src/constants/auth.constant';
import { LoginDto } from 'src/dto/login.dto';
import { RefreshTokenDto } from 'src/dto/refreshtoken.dto';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  private handleError(error) {
    if (error instanceof NotFoundException ||
      error instanceof UnauthorizedException) {}
    else {
      this.logger.error({ message: error.stack, context: AuthController.name });
    }
  }

  @SkipAuth()
  @Post('o/token')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    try {
      const user = await this.userService.findByUsername(data.username);
      const valid = user ? await this.userService.validateCredentials(user, data.password) : false;

      if (!valid) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      const token = await this.tokenService.generateAccessToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user, 60 * 60 * 24 * 30);

      return {
        type: 'bearer',
        token: token,
        refresh_token: refreshToken
      }
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @SkipAuth()
  @Post('o/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() data: RefreshTokenDto) {
    const { user, token } = await this.tokenService.createAccessTokenFromRefreshToken(data.refresh_token);
    return {
      type: 'bearer',
      token: token
    }
  }

  @Get('api/current-user')
  async userDetails(@Req() request) {
    try {
      const o = request.user;
      const user = await this.userService.findById(o.id);

      if (user) {
        return {
          id: user.id,
          username: user.username,
          roles: user.roles
        }
      }

      else {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}
