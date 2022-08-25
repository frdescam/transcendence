import { IsNotEmpty, IsString, Length } from 'class-validator';

// erase me
export class UserRegistrationDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
      pseudo: string;

    @IsString()
    @IsNotEmpty()
      password: string;
}