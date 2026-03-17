import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProduccionLecheraDto {
  @IsString()
  @IsNotEmpty()
  numero_produccion: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  animal?: any;
}

export class CreateProduccionCarneDto {
  @IsNumber()
  @IsNotEmpty()
  peso_canal: number;

  @IsOptional()
  animal?: any;
}
