import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

// MONTA
export class RegistrarMontaDto {
@IsString()
  @IsNotEmpty()
  numero_monta: string;

  @IsNumber()
  @IsNotEmpty()
  animal_hembra_id: number;

  @IsString()
  @IsNotEmpty()
  tipo_monta: string;

  @IsNumber()
  @IsOptional()
  animal_macho_id?: number;

  @IsString()
  @IsOptional()
  codigo_pajilla?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  fecha_programacion?: string;
}

// DIAGNÓSTICO
export class RegistrarDiagnosticoDto {
  @IsNumber()
  @IsNotEmpty()
  montaId: number;

  @IsString()
  @IsNotEmpty()
  metodo: string;

  @IsString()
  @IsNotEmpty()
  resultado: string;

  @IsString()
  @IsOptional()
  fecha_programacion?: string;
}

// PARTO
export class RegistrarPartoDto {
  @IsNumber()
  @IsNotEmpty()
  diagnosticoId: number;

  @IsString()
  @IsNotEmpty()
  numero_parto: string;

  @IsString()
  @IsNotEmpty()
  tipo_parto: string;
}