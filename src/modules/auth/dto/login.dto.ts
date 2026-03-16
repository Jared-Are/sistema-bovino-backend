import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El identificador debe ser texto' })
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'El teléfono debe contener entre 8 y 15 números, y puede incluir un signo + al inicio' })
  identificador: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}