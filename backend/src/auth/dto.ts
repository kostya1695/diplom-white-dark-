import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(6, { message: 'Пароль не короче 6 символов' })
  password!: string;

  @IsNotEmpty()
  fullName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
