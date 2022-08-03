import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required'})
  @MaxLength(150)
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(130)
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Role is required' })
  @IsNumber()
  role_id: number;
}
