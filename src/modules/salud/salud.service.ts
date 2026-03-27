import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
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
    const result = await this.tratamientoRepo
      .createQueryBuilder('t')
      .select("MAX(CAST(SUBSTRING(t.numero_tratamiento FROM 6) AS INTEGER))", "maxNumero")
      .where('t.numero_tratamiento IS NOT NULL')
      .getRawOne();

    const maxNumero = result?.maxNumero || 0;
    return `TRAT-${(maxNumero + 1).toString().padStart(4, '0')}`;
  }

  // ===== TIPOS DE TRATAMIENTO =====
  
  async verificarNombreTipo(nombre: string, fincaId: number, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.tipoRepo
      .createQueryBuilder('tipo')
      .where('tipo.nombre = :nombre', { nombre })
      .andWhere('tipo.finca_id = :fincaId', { fincaId });
    
    if (excludeId) {
      queryBuilder.andWhere('tipo.id != :excludeId', { excludeId });
    }
    
    const tipo = await queryBuilder.getOne();
    return !!tipo;
  }

  async createTipo(dto: CreateTipoTratamientoDto, fincaId: number) {
    const existe = await this.verificarNombreTipo(dto.nombre, fincaId);
    if (existe) throw new ConflictException('El nombre ya existe');

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
    
    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    if (dto.nombre && dto.nombre !== tipo.nombre) {
      const existe = await this.verificarNombreTipo(dto.nombre, fincaId, id);
      if (existe) {
        throw new ConflictException(`El tipo "${dto.nombre}" ya está registrado`);
      }
    }
    
    Object.assign(tipo, dto);
    return this.tipoRepo.save(tipo);
  }

  async verificarTipoEnUso(id: number, fincaId: number): Promise<boolean> {
    await this.findOneTipo(id, fincaId);
    
    const tratamientosConTipo = await this.tratamientoRepo
      .createQueryBuilder('tratamiento')
      .where('tratamiento.tipo_tratamiento_id = :id', { id })
      .andWhere('tratamiento.fecha_eliminacion IS NULL')
      .getCount();
    
    return tratamientosConTipo > 0;
  }

  async removeTipo(id: number, fincaId: number) {
    const enUso = await this.verificarTipoEnUso(id, fincaId);
    if (enUso) {
      throw new ConflictException('No se puede eliminar el tipo porque hay tratamientos asociados a él');
    }
    
    await this.tipoRepo.softDelete(id);
    return { message: 'Tipo eliminado' };
  }

  // ===== TRATAMIENTOS =====
  
  async createTratamiento(dto: CreateTratamientoDto, fincaId: number) {
    await this.findOneTipo(dto.tipo_tratamiento_id, fincaId);

    const animal = await this.tratamientoRepo.manager
      .getRepository('animales')
      .createQueryBuilder('a')
      .where('a.animal_id = :animalId', { animalId: dto.animal_id })
      .andWhere('a.finca_id = :fincaId', { fincaId })
      .getOne();

    if (!animal) throw new BadRequestException('Animal no válido');

    const tratamiento = this.tratamientoRepo.create({
      ...dto,
      numero_tratamiento: await this.generarNumeroTratamiento(),
      fecha_creacion: new Date(),
    });

    return this.tratamientoRepo.save(tratamiento);
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

    const { numero_tratamiento, ...datosActualizables } = dto as any;
    Object.assign(tratamiento, datosActualizables);
    return this.tratamientoRepo.save(tratamiento);
  }

  async removeTratamiento(id: number, fincaId: number) {
    await this.findOneTratamiento(id, fincaId);
    await this.tratamientoRepo.update(id, { numero_tratamiento: null as any });
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

    if (limit) query.limit(limit);
    return query.getMany();
  }
}