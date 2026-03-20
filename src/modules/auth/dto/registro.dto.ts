import { IsString, IsNotEmpty, IsNumber, MinLength, IsEmail, IsOptional } from 'class-validator';

export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  rol: string;

  @IsNumber()
  @IsNotEmpty({ message: 'El ID de la finca es obligatorio' })
  fincaId: number;
}