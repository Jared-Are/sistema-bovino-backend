import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

// MONTA
export class RegistrarMontaDto {
  @IsString()
  @IsNotEmpty()
  numero_monta: string;

  @IsString()
  @IsNotEmpty()
  tipo_monta: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsDateString()
  @IsOptional()
  fecha_programacion?: string;

  // 👇 Aquí está la magia: Usamos exactamente lo que el Servicio pide
  @IsNotEmpty()
  animalHembraId: number;

  @IsOptional()
  animalMachoId?: number;
}

// DIAGNÓSTICO
export class RegistrarDiagnosticoDto {
  @IsString()
  @IsNotEmpty()
  numero_prenez: string;

  @IsString()
  @IsNotEmpty()
  metodo: string;

  @IsString()
  @IsNotEmpty()
  resultado: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_programacion: string;

  @IsOptional()
  monta?: any;
}

// PARTO
export class RegistrarPartoDto {
  @IsString()
  @IsNotEmpty()
  numero_parto: string;

  @IsString()
  @IsNotEmpty()
  tipo_parto: string;

  @IsOptional()
  diagnostico_prenez?: any;
}
