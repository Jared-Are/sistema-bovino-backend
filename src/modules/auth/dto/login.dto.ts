import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  @MinLength(10, { message: 'El número de teléfono debe tener al menos 10 caracteres' })
  @MaxLength(15, { message: 'El número de teléfono no debe exceder 15 caracteres' })
  identificador: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}
