import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnimalesService } from './animales.service';
import { Animal } from './entities/animal.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SexoAnimal } from '../../common/enums';
import { IsNull } from 'typeorm';

describe('AnimalesService', () => {
  let service: AnimalesService;
  let mockRepository: any;

  const mockAnimales = [{
    animal_id: 9,
    arete: 'NIC-2026-001',
    nombre: 'La Consentida',
    sexo: SexoAnimal.HEMBRA,
    peso_nacimiento: 35.50,
    peso_actual: 45.50,
    fecha_nacimiento: new Date('2026-03-01'),
    fecha_destete: null,
    imagen: null,
    finca: { finca_id: 1 },
    raza: null,
    lote: null,
    potrero: null,
    madre: null,
    padre: null,
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date(),
    fecha_eliminacion: null,
  }];

   beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        animal_id: 100,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      })),
      save: jest.fn().mockImplementation((animal) => Promise.resolve(animal)),
      find: jest.fn().mockResolvedValue(mockAnimales),  //  Array completo
      findOne: jest.fn().mockImplementation((options) => {
        if (options.where?.animal_id) {
          const found = mockAnimales.find(a => a.animal_id === options.where.animal_id);
          return Promise.resolve(found || null);
        }
        if (options.where?.arete) {
          const found = mockAnimales.find(a => a.arete === options.where.arete);
          return Promise.resolve(found || null);
        }
        return Promise.resolve(null);
      }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimalesService,
        {
          provide: getRepositoryToken(Animal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AnimalesService>(AnimalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe retornar todos los animales activos de la finca', async () => {
      const result = await service.findAll(1);
      
      expect(result).toEqual(mockAnimales);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          finca: { finca_id: 1 },
          fecha_eliminacion: IsNull(),
        },
        relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar un animal por ID', async () => {
      const result = await service.findOne(9, 1);
      
      expect(result).toEqual(mockAnimales[0]);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          animal_id: 9,
          finca: { finca_id: 1 },
          fecha_eliminacion: IsNull(),
        },
        relations: ['raza', 'lote', 'potrero', 'madre', 'padre'],
      });
    });

    it('debe lanzar NotFoundException si el animal no existe', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

describe('create', () => {
  const createAnimalDto = {
    arete: 'NUEVO-001',
    nombre: 'Nueva Vaca',
    sexo: SexoAnimal.HEMBRA,
    peso_nacimiento: 40,
    fecha_nacimiento: '2026-05-01',
  };

  it('debe crear un nuevo animal exitosamente', async () => {
    // Simular que el arete NO existe
    mockRepository.findOne.mockResolvedValueOnce(null);
    
    const result = await service.create(createAnimalDto, 1);
    
    // Verificar que result contiene los datos enviados + campos automáticos
    expect(result).toMatchObject({
      arete: 'NUEVO-001',
      nombre: 'Nueva Vaca',
      sexo: SexoAnimal.HEMBRA,
      peso_nacimiento: 40,
      peso_actual: 40, // debe tomar peso_nacimiento
      fecha_nacimiento: '2026-05-01',
      finca: { finca_id: 1 },
    });
    
    // Verificar que tiene ID y fechas
    expect(result).toHaveProperty('animal_id');
    expect(result).toHaveProperty('fecha_creacion');
    expect(result).toHaveProperty('fecha_actualizacion');
    
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('debe lanzar error si el arete ya existe', async () => {
    mockRepository.findOne.mockResolvedValue(mockAnimales[0]);
    
    await expect(service.create(createAnimalDto, 1)).rejects.toThrow(BadRequestException);
  });

  it('debe lanzar error si fecha_destete es anterior a fecha_nacimiento', async () => {
    const dtoConDesteteInvalido = { ...createAnimalDto, fecha_destete: '2025-01-01' };
    
    await expect(service.create(dtoConDesteteInvalido, 1)).rejects.toThrow(BadRequestException);
  });

  it('debe convertir el arete a mayúsculas', async () => {
    mockRepository.findOne.mockResolvedValueOnce(null);
    
    const dtoAreteMinuscula = { ...createAnimalDto, arete: 'nuevo-002' };
    
    await service.create(dtoAreteMinuscula, 1);
    
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ arete: 'NUEVO-002' })
    );
  });

  it('debe usar peso_nacimiento como peso_actual si no se envía peso_actual', async () => {
    mockRepository.findOne.mockResolvedValueOnce(null);
    
    const dtoSinPesoActual = { 
      arete: 'NUEVO-003', 
      sexo: SexoAnimal.HEMBRA, 
      peso_nacimiento: 50, 
      fecha_nacimiento: '2026-05-01' 
    };
    
    await service.create(dtoSinPesoActual as any, 1);
    
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ peso_actual: 50 })
    );
  });
});

  describe('update', () => {
    const updateAnimalDto = {
      nombre: 'La Consentida Actualizada',
      peso_actual: 55.50,
    };

    it('debe actualizar un animal exitosamente', async () => {
      const animalActualizado = { ...mockAnimales[0], ...updateAnimalDto };
      mockRepository.save.mockResolvedValueOnce(animalActualizado);
      
      const result = await service.update(9, updateAnimalDto, 1);
      
      expect(result.nombre).toBe('La Consentida Actualizada');
      expect(result.peso_actual).toBe(55.50);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error si el animal no existe', async () => {
      await expect(service.update(999, updateAnimalDto, 1)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar error si fecha_destete es anterior al nacimiento', async () => {
      const updateConDesteteInvalido = { fecha_destete: '2025-01-01' };
      
      await expect(service.update(9, updateConDesteteInvalido, 1)).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar solo los campos enviados', async () => {
      const updateParcial = { nombre: 'Solo Nombre Actualizado' };
      
      mockRepository.save.mockResolvedValueOnce({
        ...mockAnimales[0]  ,
        nombre: 'Solo Nombre Actualizado',
      });
      
      const result = await service.update(9, updateParcial, 1);
      
      expect(result.nombre).toBe('Solo Nombre Actualizado');
      expect(result.peso_actual).toBe(mockAnimales[0].peso_actual);
    });
  });

  describe('remove', () => {
    it('debe eliminar un animal (soft delete)', async () => {
      const result = await service.remove(9, 1);
      
      expect(result).toEqual({ affected: 1 });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(9);
    });

    it('debe lanzar error si el animal no existe', async () => {
      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkArete', () => {
    it('debe retornar true si el arete existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockAnimales[0]);
      
      const result = await service.checkArete('NIC-2026-001', 1);
      
      expect(result).toBe(true);
    });

    it('debe retornar false si el arete no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      const result = await service.checkArete('NO-EXISTE', 1);
      
      expect(result).toBe(false);
    });

    it('debe convertir el arete a mayúsculas para la búsqueda', async () => {
      await service.checkArete('nic-2026-001', 1);
      
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          arete: 'NIC-2026-001',
          finca: { finca_id: 1 },
          fecha_eliminacion: IsNull(),
        },
      });
    });
  });
});