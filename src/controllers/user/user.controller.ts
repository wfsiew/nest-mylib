import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Logger, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppConstant } from 'src/constants/app.constant';
import { TOKEN_NAME } from 'src/constants/auth.constant';
import { UserDto } from 'src/dto/user.dto';
import { UserService } from 'src/services/user/user.service';
import { RoleService } from 'src/services/role/role.service';
import { BookService } from 'src/services/book/book.service';
import { Pager } from 'src/utils/pager';
import { User } from 'src/models/model';
import { SkipAuth } from 'src/constants/auth.constant';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly bookService: BookService,
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

  @ApiBearerAuth(TOKEN_NAME)
  @Post('register-book/:book_id/:user_id')
  async registerBook(
    @Param('book_id') book_id: number,
    @Param('user_id') user_id: number
  ) {
    try {
      const b = await this.bookService.isBookAvailable(1);
      if (b) {
        await this.bookService.registerBorrow(book_id, user_id);
        return {
          success: 1
        }
      }
      
      else {
        throw new BadRequestException('Book not available');
      }
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiBearerAuth(TOKEN_NAME)
  @Post('return-book/:book_id/:user_id')
  async returnBook(
    @Param('book_id') book_id: number,
    @Param('user_id') user_id: number
  ) {
    try {
      await this.bookService.returnBorrow(book_id, user_id);
      return {
        success: 1
      }

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}
