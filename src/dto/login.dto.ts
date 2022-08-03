import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  readonly username: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  readonly password: string;
}
