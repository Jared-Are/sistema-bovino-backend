
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';
import { RolUsuario, EstadoUsuario } from '../../../common/enums';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;

  @IsOptional()
  finca_id?: number;
  contrasena: string; 
}