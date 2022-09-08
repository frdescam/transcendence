import { IsInt, IsNotEmpty, IsNumber, IsNumberString, IsPositive, IsString, Length } from 'class-validator';

// create only 1 class instead of 1000

export class idValidationDto {
	@IsNotEmpty()
	@IsPositive()
  @IsInt()
	  id: number;
}

export class avatarValidationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
    pseudo: string;
}

export class updateUserValidationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
    update_pseudo: string;
}