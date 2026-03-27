import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  // --- RAZAS ---
  async crearRaza(datos: any, fincaId: number) {
    const existe = await this.verificarNombreRaza(datos.nombre, fincaId);
    if (existe) {
      throw new ConflictException(`La raza "${datos.nombre}" ya está registrada`);
    }
    return this.razaRepo.save({ ...datos, finca: { finca_id: fincaId } as any });
  }

  async obtenerRazas(fincaId: number) {
    return this.razaRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async obtenerRazaPorId(id: number, fincaId: number) {
    const raza = await this.razaRepo.findOne({
      where: { raza_id: id, finca: { finca_id: fincaId } }
    });
    if (!raza) throw new NotFoundException(`Raza con ID ${id} no encontrada en tu finca`);
    return raza;
  }

  async actualizarRaza(id: number, datos: { nombre?: string; descripcion?: string }, fincaId: number) {
    if (datos.nombre) {
      const existe = await this.verificarNombreRaza(datos.nombre, fincaId, id);
      if (existe) {
        throw new ConflictException(`La raza "${datos.nombre}" ya está registrada`);
      }
    }
    
    await this.obtenerRazaPorId(id, fincaId);
    return this.razaRepo.update(id, datos);
  }

  async verificarRazaEnUso(id: number, fincaId: number): Promise<boolean> {
  await this.obtenerRazaPorId(id, fincaId);
  
  const animalesConRaza = await this.razaRepo
    .createQueryBuilder('raza')
    .leftJoin('raza.animales', 'animal')
    .where('raza.raza_id = :id', { id })
    .andWhere('animal.fecha_eliminacion IS NULL')
    .andWhere('animal.finca_id = :fincaId', { fincaId })
    .getCount();
  
  return animalesConRaza > 0;
}

  async eliminarRaza(id: number, fincaId: number) {
    const enUso = await this.verificarRazaEnUso(id, fincaId);
    if (enUso) {
      throw new ConflictException('No se puede eliminar la raza porque hay animales asociados a ella');
    }
    
    return this.razaRepo.softDelete(id);
  }

  async verificarNombreRaza(nombre: string, fincaId: number, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.razaRepo
      .createQueryBuilder('raza')
      .where('raza.nombre = :nombre', { nombre })
      .andWhere('raza.finca_id = :fincaId', { fincaId });
    
    if (excludeId) {
      queryBuilder.andWhere('raza.raza_id != :excludeId', { excludeId });
    }
    
    const raza = await queryBuilder.getOne();
    return !!raza;
  }

  // --- LOTES ---
  async crearLote(datos: any, fincaId: number) {
    const existe = await this.verificarNombreLote(datos.nombre, fincaId);
    if (existe) {
      throw new ConflictException(`El lote "${datos.nombre}" ya está registrado`);
    }
    return this.loteRepo.save({ 
        ...datos, 
        finca: { finca_id: fincaId } as any 
    });
  }

  async obtenerLotes(fincaId: number) {
    return this.loteRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async obtenerLotePorId(id: number, fincaId: number) {
    const lote = await this.loteRepo.findOne({
      where: { lote_id: id, finca: { finca_id: fincaId } }
    });
    if (!lote) throw new NotFoundException(`Lote con ID ${id} no encontrado en tu finca`);
    return lote;
  }

  async actualizarLote(id: number, datos: any, fincaId: number) {
    if (datos.nombre) {
      const existe = await this.verificarNombreLote(datos.nombre, fincaId, id);
      if (existe) {
        throw new ConflictException(`El lote "${datos.nombre}" ya está registrado`);
      }
    }
    
    await this.obtenerLotePorId(id, fincaId);
    return this.loteRepo.update(id, datos);
  }

  async verificarLoteEnUso(id: number, fincaId: number): Promise<boolean> {
  await this.obtenerLotePorId(id, fincaId);
  
  const animalesConLote = await this.loteRepo
    .createQueryBuilder('lote')
    .leftJoin('lote.animales', 'animal')
    .where('lote.lote_id = :id', { id })
    .andWhere('animal.fecha_eliminacion IS NULL')
    .andWhere('animal.finca_id = :fincaId', { fincaId })
    .getCount();
  
  return animalesConLote > 0;
}

  async eliminarLote(id: number, fincaId: number) {
    const enUso = await this.verificarLoteEnUso(id, fincaId);
    if (enUso) {
      throw new ConflictException('No se puede eliminar el lote porque hay animales asociados a él');
    }
    
    return this.loteRepo.softDelete(id);
  }

  async verificarNombreLote(nombre: string, fincaId: number, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.loteRepo
      .createQueryBuilder('lote')
      .where('lote.nombre = :nombre', { nombre })
      .andWhere('lote.finca_id = :fincaId', { fincaId });
    
    if (excludeId) {
      queryBuilder.andWhere('lote.lote_id != :excludeId', { excludeId });
    }
    
    const lote = await queryBuilder.getOne();
    return !!lote;
  }

  // --- POTREROS ---
  async crearPotrero(datos: any, fincaId: number) {
    const existe = await this.verificarNombrePotrero(datos.nombre, fincaId);
    if (existe) {
      throw new ConflictException(`El potrero "${datos.nombre}" ya está registrado`);
    }
    return this.potreroRepo.save({ 
        ...datos, 
        finca: { finca_id: fincaId } as any 
    });
  }

  async obtenerPotreros(fincaId: number) {
    return this.potreroRepo.find({
        where: { finca: { finca_id: fincaId } }
    });
  }

  async obtenerPotreroPorId(id: number, fincaId: number) {
    const potrero = await this.potreroRepo.findOne({
      where: { potrero_id: id, finca: { finca_id: fincaId } }
    });
    if (!potrero) throw new NotFoundException(`Potrero con ID ${id} no encontrado en tu finca`);
    return potrero;
  }

  async actualizarPotrero(id: number, datos: any, fincaId: number) {
    if (datos.nombre) {
      const existe = await this.verificarNombrePotrero(datos.nombre, fincaId, id);
      if (existe) {
        throw new ConflictException(`El potrero "${datos.nombre}" ya está registrado`);
      }
    }
    
    await this.obtenerPotreroPorId(id, fincaId);
    return this.potreroRepo.update(id, datos);
  }

  async verificarPotreroEnUso(id: number, fincaId: number): Promise<boolean> {
  await this.obtenerPotreroPorId(id, fincaId);
  
  const animalesConPotrero = await this.potreroRepo
    .createQueryBuilder('potrero')
    .leftJoin('potrero.animales', 'animal')
    .where('potrero.potrero_id = :id', { id })
    .andWhere('animal.fecha_eliminacion IS NULL')
    .andWhere('animal.finca_id = :fincaId', { fincaId })
    .getCount();
  
  return animalesConPotrero > 0;
}

  async eliminarPotrero(id: number, fincaId: number) {
    const enUso = await this.verificarPotreroEnUso(id, fincaId);
    if (enUso) {
      throw new ConflictException('No se puede eliminar el potrero porque hay animales asociados a él');
    }
    
    return this.potreroRepo.softDelete(id);
  }

  async verificarNombrePotrero(nombre: string, fincaId: number, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.potreroRepo
      .createQueryBuilder('potrero')
      .where('potrero.nombre = :nombre', { nombre })
      .andWhere('potrero.finca_id = :fincaId', { fincaId });
    
    if (excludeId) {
      queryBuilder.andWhere('potrero.potrero_id != :excludeId', { excludeId });
    }
    
    const potrero = await queryBuilder.getOne();
    return !!potrero;
  }
}