import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CrearVacunaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  veterinario: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsDateString()
  @IsOptional()
  proximaFecha?: string;

  // Identificador de la Relación
  @IsOptional()
  animal?: any;
}

export class ActualizarVacunaDto extends PartialType(CrearVacunaDto) {}
