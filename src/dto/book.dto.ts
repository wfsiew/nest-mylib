import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterBookDto {

  @ApiProperty()
  @IsNotEmpty({ message: 'ISBN is required' })
  readonly isbn: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  readonly username: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  image: Express.Multer.File;
}