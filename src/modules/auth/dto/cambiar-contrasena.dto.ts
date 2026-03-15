import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CambiarContrasenaDto {
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  nuevaContrasena: string;
}
