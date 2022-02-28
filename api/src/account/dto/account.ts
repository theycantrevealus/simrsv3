import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class AccountLoginDTO {
  @ApiProperty({
    uniqueItems: true,
    example: 'takashitanaka@pondokcoder.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    minLength: 6,
    example: '123',
  })
  @IsString()
  password: string;
}

export class LoginResponseDTO {
  @ApiProperty({ example: 200 })
  @IsNumber()
  status: number;

  @ApiProperty({ example: 'user_login_success' })
  @IsString()
  message: string;

  @ApiProperty({
    example: {
      uid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      email: 'example@domain.com',
      first_name: 'John',
      last_name: 'Doe',
    },
    nullable: true,
  })
  user: InterfaceAccount;

  @ApiProperty({ example: 'ey...' })
  @IsString()
  token: string;

  @ApiProperty({ example: null, nullable: true })
  errors: { [key: string]: any };
}

export interface InterfaceAccount {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
