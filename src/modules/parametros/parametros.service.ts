import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raza } from './entities/raza.entity';
import { Lote } from './entities/lote.entity';
import { Potrero } from './entities/potrero.entity';

@Injectable()
export class ParametrosService {
  constructor(
    @InjectRepository(Raza) private razaRepo: Repository<Raza>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(Potrero) private potreroRepo: Repository<Potrero>,
  ) {}

  async crearRaza(nombre: string, descripcion: string, fincaId: number) {
    return this.razaRepo.save({ nombre, descripcion, finca: { finca_id: fincaId } as any });
  }

  async obtenerRazas() {
    return this.razaRepo.find();
  }

  // 👇 ¡ESTO ES LO QUE NECESITAS!
  async crearLote(nombre: string, fincaId: number) {
    return this.loteRepo.save({ nombre, finca: { finca_id: fincaId } as any });
  }

  async crearPotrero(nombre: string, fincaId: number) {
    return this.potreroRepo.save({ nombre, finca: { finca_id: fincaId } as any });
  }
}