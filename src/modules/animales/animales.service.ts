import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Animal } from './entities/animal.entity';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalesService {
  constructor(
    @InjectRepository(Animal)
    private animalesRepository: Repository<Animal>,
  ) {}

  async create(createAnimalDto: CreateAnimalDto, fincaId: number) {
    if (createAnimalDto.fecha_destete && new Date(createAnimalDto.fecha_destete) < new Date(createAnimalDto.fecha_nacimiento)) {
    throw new BadRequestException('La fecha de destete no puede ser anterior a la fecha de nacimiento');
  }

  const existeArete = await this.animalesRepository.findOne({
    where: {
      arete: createAnimalDto.arete.toUpperCase(),
      finca: { finca_id: fincaId },
      fecha_eliminacion: IsNull()
    }
  });

  if (existeArete) {
    throw new BadRequestException(`El arete "${createAnimalDto.arete}" ya está registrado`);
  }

  const animalData: any = {
    arete: createAnimalDto.arete.toUpperCase(),
    nombre: createAnimalDto.nombre || null,
    sexo: createAnimalDto.sexo,
    peso_nacimiento: createAnimalDto.peso_nacimiento || 0,
    peso_actual: createAnimalDto.peso_actual || createAnimalDto.peso_nacimiento || 0,
    fecha_nacimiento: createAnimalDto.fecha_nacimiento,
    fecha_destete: createAnimalDto.fecha_destete || null,
    imagen: createAnimalDto.imagen || null,
    finca: { finca_id: fincaId },
  };

  if (createAnimalDto.raza_id) animalData.raza = { raza_id: createAnimalDto.raza_id };
  if (createAnimalDto.lote_id) animalData.lote = { lote_id: createAnimalDto.lote_id };
  if (createAnimalDto.potrero_id) animalData.potrero = { potrero_id: createAnimalDto.potrero_id };
  if (createAnimalDto.animal_madre_id) animalData.madre = { animal_id: createAnimalDto.animal_madre_id };
  if (createAnimalDto.animal_padre_id) animalData.padre = { animal_id: createAnimalDto.animal_padre_id };

  const nuevoAnimal = this.animalesRepository.create(animalData);
  return this.animalesRepository.save(nuevoAnimal);
  }

  async checkArete(arete: string, fincaId: number): Promise<boolean> {
    const animal = await this.animalesRepository.findOne({
      where: {
        arete: arete.toUpperCase(),
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      }
    });
    return !!animal;
  }

  async findAll(fincaId: number) {
    return this.animalesRepository.find({
      where: { 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      },
      relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
    });
  }

  async findOne(id: number, fincaId: number) {
    const animal = await this.animalesRepository.findOne({
      where: { 
        animal_id: id, 
        finca: { finca_id: fincaId },
        fecha_eliminacion: IsNull()
      },
      relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado en tu finca.`);
    }

    return animal;
  }

  async update(id: number, updateAnimalDto: UpdateAnimalDto, fincaId: number) {
  const animal = await this.findOne(id, fincaId);
    
  if (updateAnimalDto.nombre !== undefined) animal.nombre = updateAnimalDto.nombre;
  if (updateAnimalDto.peso_actual !== undefined) animal.peso_actual = updateAnimalDto.peso_actual;
  
  if (updateAnimalDto.fecha_destete !== undefined) {
    const nuevaFecha = new Date(updateAnimalDto.fecha_destete);
    if (nuevaFecha < animal.fecha_nacimiento) {
      throw new BadRequestException('La fecha de destete no puede ser anterior al nacimiento');
    }
    animal.fecha_destete = nuevaFecha;
  }
 
  if (updateAnimalDto.imagen !== undefined) animal.imagen = updateAnimalDto.imagen;
  if (updateAnimalDto.raza_id !== undefined) animal.raza = { raza_id: updateAnimalDto.raza_id } as any;
  if (updateAnimalDto.lote_id !== undefined) animal.lote = { lote_id: updateAnimalDto.lote_id } as any;
  if (updateAnimalDto.potrero_id !== undefined) animal.potrero = { potrero_id: updateAnimalDto.potrero_id } as any;
  if (updateAnimalDto.animal_madre_id !== undefined) animal.madre = { animal_id: updateAnimalDto.animal_madre_id } as any;
  if (updateAnimalDto.animal_padre_id !== undefined) animal.padre = { animal_id: updateAnimalDto.animal_padre_id } as any;

  return this.animalesRepository.save(animal);
}

  async remove(id: number, fincaId: number) {
    await this.findOne(id, fincaId); 
    return this.animalesRepository.softDelete(id); 
  }
}