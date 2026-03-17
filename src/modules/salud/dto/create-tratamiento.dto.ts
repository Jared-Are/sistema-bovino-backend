import { IsNumber, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { EstadoTratamiento } from '../../../common/enums';

export class CreateTratamientoDto {
  @IsNumber()
  @IsNotEmpty()
  tipo_tratamiento_id: number;

  @IsEnum(EstadoTratamiento)
  @IsOptional()
  estado?: EstadoTratamiento;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsNumber()
  @IsNotEmpty()
  animal_id: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}