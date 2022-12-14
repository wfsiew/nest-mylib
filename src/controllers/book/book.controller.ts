import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Logger, NotFoundException, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppConstant } from 'src/constants/app.constant';
import { TOKEN_NAME } from 'src/constants/auth.constant';
import { RegisterBookDto } from 'src/dto/book.dto';
import { UserService } from 'src/services/user/user.service';
import { BookService } from 'src/services/book/book.service';
import { Pager } from 'src/utils/pager';
import { User } from 'src/models/model';
import { SkipAuth } from 'src/constants/auth.constant';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/auth/models';
import { AuthenticatedUser } from 'src/auth/auth-user.decorator';
import * as fs from 'fs';
import stream = require('stream');
import * as util from 'util';

@ApiTags('book-controller')
@Controller('book')
export class BookController {

  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  private handleError(error) {
    if (error instanceof NotFoundException) {}
    else {
      this.logger.error({ message: error.stack, context: BookController.name });
    }
  }

  @SkipAuth()
  @ApiQuery({
    name: '_page'
  })
  @ApiQuery({
    name: '_limit',
    description: 'page size'
  })
  @Get('available')
  async listBooks(
    @Query('_page') page = '1',
    @Query('_limit') limit = '20',
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    try {
      const total = await this.bookService.count();
      const pg = new Pager(total, Number(page), Number(limit));
      const lx = this.bookService.findAll(pg.lowerBound, pg.pageSize);
      res.header(AppConstant.X_TOTAL_COUNT, `${total}`);
      res.header(AppConstant.X_TOTAL_PAGE, `${pg.totalPages}`);
      return lx;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiQuery({
    name: '_page'
  })
  @ApiQuery({
    name: '_limit',
    description: 'page size'
  })
  @ApiBearerAuth(TOKEN_NAME)
  @Get('borrow/current')
  async listBooksCurrent(
    @Query('_page') page = '1',
    @Query('_limit') limit = '20',
    @AuthenticatedUser() user: AuthUser,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() request
  ) {
    try {
      const total = await this.bookService.countCurrentBooksBorrowByUserId(user.id);
      const pg = new Pager(total, Number(page), Number(limit));
      const lx = this.bookService.findAllCurrentBooksBorrowByUserId(user.id, pg.lowerBound, pg.pageSize);
      res.header(AppConstant.X_TOTAL_COUNT, `${total}`);
      res.header(AppConstant.X_TOTAL_PAGE, `${pg.totalPages}`);
      return lx;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiQuery({
    name: '_page'
  })
  @ApiQuery({
    name: '_limit',
    description: 'page size'
  })
  @ApiBearerAuth(TOKEN_NAME)
  @Get('borrow/history')
  async listBooksHistory(
    @Query('_page') page = '1',
    @Query('_limit') limit = '20',
    @AuthenticatedUser() user: AuthUser,
    @Res({ passthrough: true }) res: FastifyReply,
    @Req() request
  ) {
    try {
      const total = await this.bookService.countHistoryBooksBorrowByUserId(user.id);
      const pg = new Pager(total, Number(page), Number(limit));
      const lx = this.bookService.findAllHistoryBooksBorrowByUserId(user.id, pg.lowerBound, pg.pageSize);
      res.header(AppConstant.X_TOTAL_COUNT, `${total}`);
      res.header(AppConstant.X_TOTAL_PAGE, `${pg.totalPages}`);
      return lx;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiQuery({
    name: '_page'
  })
  @ApiQuery({
    name: '_limit',
    description: 'page size'
  })
  @ApiBearerAuth(TOKEN_NAME)
  @Get('borrow/all')
  async listBooksAll(
    @Query('_page') page = '1',
    @Query('_limit') limit = '20',
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    try {
      const total = await this.bookService.countAllBooksBorrow();
      const pg = new Pager(total, Number(page), Number(limit));
      const lx = this.bookService.findAllBooksBorrow(pg.lowerBound, pg.pageSize);
      res.header(AppConstant.X_TOTAL_COUNT, `${total}`);
      res.header(AppConstant.X_TOTAL_PAGE, `${pg.totalPages}`);
      return lx;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiBearerAuth(TOKEN_NAME)
  @Post('borrow/register')
  async registerBook(@Body() data: RegisterBookDto) {
    try {
      const book = await this.bookService.findByISBN(data.isbn);
      const user = await this.userService.findByUsername(data.username);
      if (book && user) {
        const x = await this.bookService.isBorrowLimitReached(user.id);
        if (x) {
          throw new BadRequestException('Maximum limit of borrow books reached');
        }

        const b = await this.bookService.isBookAvailable(book.id);
        if (b) {
          await this.bookService.registerBorrow(book.id, user.id);
          return {
            success: 1
          }
        }
        
        else {
          throw new BadRequestException('Book not available');
        }
      }
      
      else {
        if (!book) {
          throw new NotFoundException('Book not found');
        }
        
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiBearerAuth(TOKEN_NAME)
  @Post('borrow/return')
  async returnBook(@Body() data: RegisterBookDto) {
    try {
      const book = await this.bookService.findByISBN(data.isbn);
      const user = await this.userService.findByUsername(data.username);
      if (book && user) {
        await this.bookService.returnBorrow(book.id, user.id);
        return {
          success: 1
        }
      }
      
      else {
        if (!book) {
          throw new NotFoundException('Book not found');
        }
        
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @ApiBearerAuth(TOKEN_NAME)
  @Post('borrow/renew/:id/:book_id')
  async renewBook(
    @Param('id') id: number,
    @Param('book_id') book_id: number,
    @AuthenticatedUser() user: AuthUser,
    @Req() request
  ) {
    try {
      await this.bookService.renewBorrow(id, book_id, user.id);
      return {
        success: 1
      }

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  @SkipAuth()
  @Post('upload')
  async uploadBook(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const data = await req.file();
    // const pipeline = util.promisify(stream.pipeline);
    // const writeStream = fs.createWriteStream(`uploads/${data.filename}`);
    // await pipeline(data.file, writeStream);
    const o = await data.toBuffer();
    const x = o.toString('base64');
    const m = data.fields.mimeType['value'];
    const s = `data:${m};base64,${x}`;
    console.log(s)
    
    return s;
  }
}
