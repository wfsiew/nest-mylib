import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Logger, NotFoundException, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppConstant } from 'src/constants/app.constant';
import { TOKEN_NAME } from 'src/constants/auth.constant';
import { UserDto } from 'src/dto/user.dto';
import { RegisterBookDto } from 'src/dto/book.dto';
import { UserService } from 'src/services/user/user.service';
import { RoleService } from 'src/services/role/role.service';
import { User } from 'src/models/model';
import { SkipAuth } from 'src/constants/auth.constant';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('user-controller')
@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  private handleError(error) {
    if (error instanceof NotFoundException) {}
    else {
      this.logger.error({ message: error.stack, context: UserController.name });
    }
  }

  @SkipAuth()
  @Post('new')
  async create(@Body() data: UserDto) {
    try {
      const username = data.username;

      const role = await this.roleService.findById(data.role_id);
      if (role) {
        let o = new User();
        o.username = data.username;
        o.password = data.password;

        o.roles = [role];
        await this.userService.save(o);
        return {
          success: 1
        }
      }

      else {
        throw new NotFoundException('Role not found');
      }

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}
