import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoTratamientoDto } from './create-tipo-tratamiento.dto';

export class UpdateTipoTratamientoDto extends PartialType(CreateTipoTratamientoDto) {}