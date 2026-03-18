import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finca } from './entities/finca.entity';

@Injectable()
export class FincasService {
  constructor(
    @InjectRepository(Finca)
    private readonly fincaRepo: Repository<Finca>,  // ✅ Ya está correcto
  ) {}

  async crear(nombre: string, ubicacion: string) {
    const nuevaFinca = this.fincaRepo.create({ nombre, ubicacion });
    return await this.fincaRepo.save(nuevaFinca);
  }

  async obtenerTodas() {
    return await this.fincaRepo.find();
  }

  async obtenerFincasPorUsuario(fincaId: number) {
    return this.fincaRepo.find({
      where: { finca_id: fincaId },
      select: ['finca_id', 'nombre']
    });
  }
}