import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  @MinLength(8, { message: 'El número de teléfono debe tener al menos 8 caracteres' })
  @MaxLength(12, { message: 'El número de teléfono no debe exceder 12 caracteres' })
  @Matches(/^\+?[0-9]+$/, { message: 'El teléfono solo puede contener números y un signo + al inicio' })
  identificador: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}