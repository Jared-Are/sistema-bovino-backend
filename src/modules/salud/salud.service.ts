import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tratamiento } from './entities/tratamiento.entity';
import { TipoTratamiento } from './entities/tipo-tratamiento.entity';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { CreateTipoTratamientoDto } from './dto/create-tipo-tratamiento.dto';
import { UpdateTipoTratamientoDto } from './dto/update-tipo-tratamiento.dto';
import { Animal } from '../animales/entities/animal.entity';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(Tratamiento)
    private tratamientoRepo: Repository<Tratamiento>,
    @InjectRepository(TipoTratamiento)
    private tipoRepo: Repository<TipoTratamiento>,
    @InjectRepository(Animal)
    private animalRepo: Repository<Animal>,
  ) {}

  private async generarNumeroTratamiento(): Promise<string> {
    const ultimoTratamiento = await this.tratamientoRepo.findOne({
      where: { numero_tratamiento: IsNull() },
      order: { id: 'DESC' },
    });

    let nuevoNumero = 1;
    if (ultimoTratamiento?.numero_tratamiento) {
      const ultimoNumero = parseInt(ultimoTratamiento.numero_tratamiento.split('-')[1]);
      nuevoNumero = ultimoNumero + 1;
    }
    return `TRAT-${nuevoNumero.toString().padStart(4, '0')}`;
  }

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
    return this.tipoRepo.find({
      where: { finca_id: fincaId, fecha_eliminacion: IsNull() },
    });
  }

  async findOneTipo(id: number, fincaId: number) {
    const tipo = await this.tipoRepo.findOne({
      where: { id, finca_id: fincaId, fecha_eliminacion: IsNull() },
    });
    if (!tipo) throw new NotFoundException('Tipo no encontrado');
    return tipo;
  }

  async updateTipo(id: number, dto: UpdateTipoTratamientoDto, fincaId: number) {
    const tipo = await this.findOneTipo(id, fincaId);

    if (dto.nombre && dto.nombre !== tipo.nombre) {
      const existe = await this.verificarNombreTipo(dto.nombre, fincaId, id);
      if (existe) throw new ConflictException(`El tipo "${dto.nombre}" ya está registrado`);
    }

    Object.assign(tipo, dto);
    return this.tipoRepo.save(tipo);
  }

  async removeTipo(id: number, fincaId: number) {
    const tipo = await this.findOneTipo(id, fincaId);

    const tratamientosAsociados = await this.tratamientoRepo.count({
      where: { tipo_tratamiento_id: id, fecha_eliminacion: IsNull() },
    });

    if (tratamientosAsociados > 0) {
      throw new ConflictException('No se puede eliminar el tipo porque hay tratamientos asociados a él');
    }

    await this.tipoRepo.softDelete(id);
    return { message: 'Tipo eliminado' };
  }

  async createTratamiento(dto: CreateTratamientoDto, fincaId: number) {
    await this.findOneTipo(dto.tipo_tratamiento_id, fincaId);

    const animal = await this.animalRepo.findOne({
      where: { animal_id: dto.animal_id, finca: { finca_id: fincaId }, fecha_eliminacion: IsNull() },
    });
    if (!animal) throw new BadRequestException('Animal no válido');

    const tratamiento = this.tratamientoRepo.create({
      ...dto,
      numero_tratamiento: await this.generarNumeroTratamiento(),
    });

    return this.tratamientoRepo.save(tratamiento);
  }

  async findAllTratamientos(fincaId: number) {
    return this.tratamientoRepo.find({
      where: { fecha_eliminacion: IsNull() },
      relations: ['animal', 'tipo_tratamiento'],
    });
  }

  async findOneTratamiento(id: number, fincaId: number) {
    const tratamiento = await this.tratamientoRepo.findOne({
      where: { id, fecha_eliminacion: IsNull() },
      relations: ['animal', 'tipo_tratamiento'],
    });
    if (!tratamiento) throw new NotFoundException('Tratamiento no encontrado');
    return tratamiento;
  }

  async updateTratamiento(id: number, dto: UpdateTratamientoDto, fincaId: number) {
    const tratamiento = await this.findOneTratamiento(id, fincaId);

    if (dto.tipo_tratamiento_id) {
      await this.findOneTipo(dto.tipo_tratamiento_id, fincaId);
    }

    Object.assign(tratamiento, dto);
    return this.tratamientoRepo.save(tratamiento);
  }

  async removeTratamiento(id: number, fincaId: number) {
    await this.findOneTratamiento(id, fincaId);
    await this.tratamientoRepo.softDelete(id);
    return { message: 'Tratamiento eliminado correctamente' };
  }

  async findByAnimal(animalId: number, fincaId: number, limit?: number) {
    const query = this.tratamientoRepo.find({
      where: { animal_id: animalId, fecha_eliminacion: IsNull() },
      relations: ['animal', 'tipo_tratamiento'],
      order: { fecha: 'DESC' },
    });
    return query;
  }
}