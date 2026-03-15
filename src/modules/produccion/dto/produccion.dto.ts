import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTO PARA LECHE
export class RegistrarLecheDto {
  @IsString()
  @IsNotEmpty()
  numero_produccion: string;

  @IsNumber({}, { message: 'La cantidad (Litros) debe ser un número' })
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  animal?: any;
}

export class ActualizarLecheDto extends PartialType(RegistrarLecheDto) {}

// DTO PARA CARNE
export class RegistrarCarneDto {
  @IsNumber({}, { message: 'El peso del canal debe ser un número' })
  @IsNotEmpty()
  peso_canal: number;

  @IsOptional()
  animal?: any;
}

export class ActualizarCarneDto extends PartialType(RegistrarCarneDto) {}
