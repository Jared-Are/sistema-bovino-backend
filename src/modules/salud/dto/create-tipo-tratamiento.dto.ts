import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTipoTratamientoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}