import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterBookDto {

  @ApiProperty()
  @IsNotEmpty({ message: 'Title is required' })
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  readonly username: string;
}