import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { TipoTratamiento } from './entities/tipo-tratamiento.entity';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { CreateTipoTratamientoDto } from './dto/create-tipo-tratamiento.dto';
import { UpdateTipoTratamientoDto } from './dto/update-tipo-tratamiento.dto';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(Tratamiento)
    private tratamientoRepo: Repository<Tratamiento>,
    @InjectRepository(TipoTratamiento)
    private tipoRepo: Repository<TipoTratamiento>,
  ) {}
  private async generarNumeroTratamiento(): Promise<string> {
    const ultimoTratamiento = await this.tratamientoRepo
        .createQueryBuilder('t')
        .where('t.numero_tratamiento IS NOT NULL')
        .andWhere('t.fecha_eliminacion IS NULL')
        .orderBy('t.numero_tratamiento', 'DESC')
        .getOne();

    let numero = 1;
    if (ultimoTratamiento && ultimoTratamiento.numero_tratamiento) {
        const match = ultimoTratamiento.numero_tratamiento.match(/TRAT-(\d+)/);
        if (match) {
            numero = parseInt(match[1]) + 1;
        }
    }

    // Verificar que el nuevo número no exista entre activos
    let nuevoNumero = `TRAT-${numero.toString().padStart(4, '0')}`;
    let existe = await this.tratamientoRepo.findOne({
        where: { 
            numero_tratamiento: nuevoNumero,
            fecha_eliminacion: IsNull()  // Solo verificar activos
        }
    });
    
    while (existe) {
        numero++;
        nuevoNumero = `TRAT-${numero.toString().padStart(4, '0')}`;
        existe = await this.tratamientoRepo.findOne({
            where: { 
                numero_tratamiento: nuevoNumero,
                fecha_eliminacion: IsNull()
            }
        });
    }
    
    return nuevoNumero;
}
  async createTipo(dto: CreateTipoTratamientoDto, fincaId: number) {
    const existe = await this.tipoRepo.findOneBy({ nombre: dto.nombre, finca_id: fincaId });
    if (existe) throw new BadRequestException('El nombre ya existe en tu finca');

    const tipo = this.tipoRepo.create({ ...dto, finca_id: fincaId });
    return this.tipoRepo.save(tipo);
  }

  async findAllTipos(fincaId: number) {
    return this.tipoRepo.findBy({ finca_id: fincaId, fecha_eliminacion: IsNull() });
  }

  async findOneTipo(id: number, fincaId: number) {
    const tipo = await this.tipoRepo.findOneBy({ id, finca_id: fincaId, fecha_eliminacion: IsNull() });
    if (!tipo) throw new NotFoundException('Tipo no encontrado');
    return tipo;
  }

  async updateTipo(id: number, dto: UpdateTipoTratamientoDto, fincaId: number) {
    const tipo = await this.findOneTipo(id, fincaId);
    Object.assign(tipo, dto);
    return this.tipoRepo.save(tipo);
  }

  async removeTipo(id: number, fincaId: number) {
    const enUso = await this.tratamientoRepo.countBy({ tipo_tratamiento_id: id });
    if (enUso > 0) throw new BadRequestException('Tipo tiene tratamientos asociados');
    
    await this.tipoRepo.softDelete(id);
    return { message: 'Tipo eliminado' };
  }

async createTratamiento(dto: CreateTratamientoDto, fincaId: number) {
    try {
        await this.findOneTipo(dto.tipo_tratamiento_id, fincaId);

        const animal = await this.tratamientoRepo.manager
            .getRepository('animales')
            .createQueryBuilder('a')
            .where('a.animal_id = :animalId', { animalId: dto.animal_id })
            .andWhere('a.finca_id = :fincaId', { fincaId })
            .getOne();
        if (!animal) throw new BadRequestException('Animal no válido');

        const numeroTratamiento = await this.generarNumeroTratamiento();

        const tratamiento = this.tratamientoRepo.create({
            ...dto,
            numero_tratamiento: numeroTratamiento,
            fecha_creacion: new Date(),
        });
        
        const resultado = await this.tratamientoRepo.save(tratamiento);        
        return resultado;
        
    } catch (error) {
    }
}
  async findAllTratamientos(fincaId: number) {
    return this.tratamientoRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.animal', 'animal')
      .leftJoinAndSelect('t.tipo_tratamiento', 'tipo')
      .where('animal.finca_id = :fincaId', { fincaId })
      .andWhere('t.fecha_eliminacion IS NULL')
      .orderBy('t.fecha', 'DESC')
      .getMany();
  }

  async findOneTratamiento(id: number, fincaId: number) {
    const tratamiento = await this.tratamientoRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.animal', 'animal')
      .leftJoinAndSelect('t.tipo_tratamiento', 'tipo')
      .where('t.id = :id', { id })
      .andWhere('animal.finca_id = :fincaId', { fincaId })
      .andWhere('t.fecha_eliminacion IS NULL')
      .getOne();

    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');
    return tratamiento;
  }

  async updateTratamiento(id: number, dto: UpdateTratamientoDto, fincaId: number) {
    const tratamiento = await this.findOneTratamiento(id, fincaId);
    
    if (dto.tipo_tratamiento_id) {
      await this.findOneTipo(dto.tipo_tratamiento_id, fincaId);
    }
    
    //el numero_tratamiento NO se puede actualizar
    const { numero_tratamiento, ...datosActualizables } = dto as any;
    
    Object.assign(tratamiento, datosActualizables);
    return this.tratamientoRepo.save(tratamiento);
  }

  async removeTratamiento(id: number, fincaId: number) {
    await this.findOneTratamiento(id, fincaId);
    await this.tratamientoRepo.softDelete(id);
    return { message: 'Tratamiento eliminado correctamente' };
  }

  async findByAnimal(animalId: number, fincaId: number, limit?: number) {
    const query = this.tratamientoRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.animal', 'animal')
      .leftJoinAndSelect('t.tipo_tratamiento', 'tipo')
      .where('t.animal_id = :animalId', { animalId })
      .andWhere('animal.finca_id = :fincaId', { fincaId })
      .andWhere('t.fecha_eliminacion IS NULL')
      .orderBy('t.fecha', 'DESC');
    
    if (limit) {
      query.limit(limit);
    }
    
    return query.getMany();
  }
}