import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raza } from './entities/raza.entity';
import { Lote } from './entities/lote.entity';
import { Potrero } from './entities/potrero.entity';
import { ParametrosService } from './parametros.service'; // 👈 Importar
import { ParametrosController } from './parametros.controller'; // 👈 Importar

@Module({
  imports: [TypeOrmModule.forFeature([Raza, Lote, Potrero])],
  providers: [ParametrosService], // 👈 Agregar aquí
  controllers: [ParametrosController], // 👈 Agregar aquí
  exports: [TypeOrmModule, ParametrosService],
})
export class ParametrosModule {}