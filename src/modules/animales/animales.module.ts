import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Animal } from './entities/animal.entity';
import { AnimalesService } from './animales.service'; // 👈 Faltaba importar
import { AnimalesController } from './animales.controller'; // 👈 Faltaba importar

@Module({
  imports: [TypeOrmModule.forFeature([Animal])],
  controllers: [AnimalesController], // 👈 ESTO ES LO QUE FALTA
  providers: [AnimalesService],    // 👈 ESTO ES LO QUE FALTA
  exports: [AnimalesService],
})
export class AnimalesModule {}