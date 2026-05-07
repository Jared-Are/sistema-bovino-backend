import { Test, TestingModule } from '@nestjs/testing';
import { AnimalesController } from './animales.controller';
import { AnimalesService } from './animales.service';
import { SexoAnimal } from '../../common/enums';

describe('AnimalesController', () => {
  let controller: AnimalesController;
  let service: AnimalesService;

  const mockAnimal = {
    animal_id: 9,
    arete: 'NIC-2026-001',
    nombre: 'La Consentida',
    sexo: SexoAnimal.HEMBRA,  
    peso_actual: 45.50,
  };

  const mockUsuario = {
    fincaId: 1,
    userId: 'user-123',
    rol: 'PROPIETARIO',
  };

  const mockAnimalesService = {
    create: jest.fn().mockResolvedValue(mockAnimal),
    findAll: jest.fn().mockResolvedValue([mockAnimal]),
    findOne: jest.fn().mockResolvedValue(mockAnimal),
    update: jest.fn().mockResolvedValue({ ...mockAnimal, nombre: 'Actualizada' }),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
    checkArete: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimalesController],
      providers: [
        {
          provide: AnimalesService,
          useValue: mockAnimalesService,
        },
      ],
    }).compile();

    controller = module.get<AnimalesController>(AnimalesController);
    service = module.get<AnimalesService>(AnimalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createAnimalDto = {
      arete: 'NUEVO-001',
      nombre: 'Nueva Vaca',
      sexo: SexoAnimal.HEMBRA,  
      peso_nacimiento: 40,
      fecha_nacimiento: '2026-05-01',
    };

    it('debe crear un nuevo animal', async () => {
      const result = await controller.create(createAnimalDto as any, mockUsuario);
      
      expect(result).toEqual(mockAnimal);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los animales', async () => {
      const result = await controller.findAll(mockUsuario);
      
      expect(result).toEqual([mockAnimal]);
      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('debe retornar un animal por ID', async () => {
      const result = await controller.findOne('9', mockUsuario);
      
      expect(result).toEqual(mockAnimal);
      expect(service.findOne).toHaveBeenCalledWith(9, 1);
    });
  });
});