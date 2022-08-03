import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterBookDto {

  @ApiProperty()
  @IsNotEmpty({ message: 'ISBN is required' })
  readonly isbn: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  readonly username: string;
}