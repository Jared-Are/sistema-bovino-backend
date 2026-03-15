import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CrearTratamientoDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  veterinario: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  // Identificador de la Relación
  @IsOptional()
  animal?: any;
}

export class ActualizarTratamientoDto extends PartialType(CrearTratamientoDto) {}
