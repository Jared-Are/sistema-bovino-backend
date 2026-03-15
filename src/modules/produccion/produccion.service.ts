import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProduccionCarne } from './entities/produccion-carne.entity';
import { ProduccionLechera } from './entities/produccion-lechera.entity';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(ProduccionCarne) private produccionCarneRepo: Repository<ProduccionCarne>,
    @InjectRepository(ProduccionLechera) private produccionLecheraRepo: Repository<ProduccionLechera>,
  ) {}

  // =====================================
  // PRODUCCIÓN LECHERA
  // =====================================
  async registrarLeche(datos: any, fincaId: number) {
    const nueva = this.produccionLecheraRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con la vaca ordeñada
    });
    return this.produccionLecheraRepo.save(nueva);
  }

  async obtenerLeche(fincaId: number) {
    return this.produccionLecheraRepo.find({
      where: { fincaId },
      relations: ['animal'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  // =====================================
  // PRODUCCIÓN DE CARNE
  // =====================================
  async registrarCarne(datos: any, fincaId: number) {
    const nueva = this.produccionCarneRepo.create({
      ...datos,
      fincaId,
      animal: { animal_id: datos.animalId } // Relacionamos con el animal pesado/sacrificado
    });
    return this.produccionCarneRepo.save(nueva);
  }

  async obtenerCarne(fincaId: number) {
    return this.produccionCarneRepo.find({
      where: { fincaId },
      relations: ['animal'],
      order: { fecha_creacion: 'DESC' }
    });
  }
}