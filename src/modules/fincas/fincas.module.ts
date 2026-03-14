import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finca } from './entities/finca.entity';
import { FincasService } from './fincas.service'; // 👈 Importar
import { FincasController } from './fincas.controller'; // 👈 Importar

@Module({
  imports: [TypeOrmModule.forFeature([Finca])],
  providers: [FincasService], // 👈 Agregar
  controllers: [FincasController], // 👈 Agregar
  exports: [TypeOrmModule, FincasService],
})
export class FincasModule {}