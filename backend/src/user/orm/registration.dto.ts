import { IsNotEmpty, IsString, Length } from 'class-validator';

export class registrationDTO {
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
      pseudo: string;

    @IsString()
    @IsNotEmpty()
      password: string;
}