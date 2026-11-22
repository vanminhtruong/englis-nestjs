import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Enter the six-digit verification code' })
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
