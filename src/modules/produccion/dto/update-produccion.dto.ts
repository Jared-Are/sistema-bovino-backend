import { PartialType } from '@nestjs/mapped-types';
import { CreateProduccionLecheraDto, CreateProduccionCarneDto } from './create-produccion.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProduccionLecheraDto extends PartialType(CreateProduccionLecheraDto) {
  @IsNumber()
  @IsOptional()
  cantidad?: number;
}

export class UpdateProduccionCarneDto extends PartialType(CreateProduccionCarneDto) {
  @IsNumber()
  @IsOptional()
  peso_canal?: number;
}
