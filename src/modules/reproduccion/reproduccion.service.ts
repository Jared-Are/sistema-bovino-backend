import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monta } from './entities/monta.entity';
import { DiagnosticoPrenez } from './entities/diagnostico-prenez.entity';
import { Parto } from './entities/parto.entity';
import { Animal } from '../animales/entities/animal.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class ReproduccionService {
  constructor(
    @InjectRepository(Monta) 
    private readonly montasRepo: Repository<Monta>,
    
    @InjectRepository(DiagnosticoPrenez) 
    private readonly diagnosticosRepo: Repository<DiagnosticoPrenez>,
    
    @InjectRepository(Parto) 
    private readonly partosRepo: Repository<Parto>,
    
    @InjectRepository(Animal) 
    private readonly animalesRepo: Repository<Animal>,

    private readonly notificacionesService: NotificacionesService,
  ) {}

  /**
   * Helper: Obtiene la fecha de hoy en formato YYYY-MM-DD
   */
  private getHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  // =====================================
  // SECCIÓN DE MONTAS
  // =====================================

  async registrarMonta(datos: any, fincaId: number) {
    if (!datos.numero_monta || !datos.animalHembraId) {
      throw new BadRequestException('El número de monta y el ID de la hembra son obligatorios.');
    }

    const hembra = await this.animalesRepo.findOneBy({ animal_id: datos.animalHembraId });
    if (!hembra || hembra.sexo !== 'Hembra') {
      throw new BadRequestException('La monta solo puede registrarse en animales de sexo Hembra.');
    }

    // 🛡️ REGLA DE NEGOCIO: Bloquear si ya tiene un embarazo activo sin parto
    const prenecesActivas = await this.diagnosticosRepo.find({
      where: { 
        fincaId, 
        resultado: 'Positivo', 
        monta: { hembra: { animal_id: datos.animalHembraId } } 
      },
      relations: ['monta', 'monta.hembra']
    });

    for (const prenez of prenecesActivas) {
      const tieneParto = await this.partosRepo.findOne({ 
        where: { diagnostico_prenez: { id: prenez.id } } 
      });
      if (!tieneParto) {
        throw new BadRequestException(
          `La vaca ${hembra.nombre || hembra.arete} ya tiene una preñez activa. Registra el parto antes de una nueva monta.`
        );
      }
    }

    const nueva = this.montasRepo.create({
      ...datos,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      hembra: { animal_id: datos.animalHembraId },
      macho: datos.animalMachoId ? { animal_id: datos.animalMachoId } : null,
    });

    return await this.montasRepo.save(nueva);
  }

  async obtenerMontas(fincaId: number) {
    return this.montasRepo.find({
      where: { fincaId },
      relations: ['hembra', 'macho'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  // =====================================
  // SECCIÓN DE DIAGNÓSTICOS
  // =====================================

  async registrarDiagnostico(datos: any, fincaId: number, usuarioId: string) {
    if (!datos.numero_prenez || !datos.montaId || !datos.resultado) {
      throw new BadRequestException('Faltan campos obligatorios.');
    }

    const monta = await this.montasRepo.findOne({ 
        where: { id: datos.montaId }, 
        relations: ['hembra'] 
    });

    if (!monta) throw new NotFoundException('La monta referenciada no existe.');

    const nuevo = this.diagnosticosRepo.create({
      ...datos,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      monta: { id: datos.montaId }
    });
    const guardado = await this.diagnosticosRepo.save(nuevo);

    // 🔄 AUTOMATIZACIÓN: Si la vaca quedó preñada, solo actualizamos su estado
    if (datos.resultado === 'Positivo') {
        await this.animalesRepo.update(monta.hembra.animal_id, {
            estado_reproductivo: 'Gestación'
        } as any);

        await this.notificacionesService.crearAlerta(
            usuarioId,
            'Confirmación de Preñez',
            `Vaca ${monta.hembra.nombre || monta.hembra.arete}: Preñez confirmada. Estado actualizado a Gestación.`,
            'alerta',
            'reproduccion'
        );
    }

    return guardado;
  }

  async obtenerDiagnosticos(fincaId: number) {
    return this.diagnosticosRepo.find({
      where: { fincaId },
      relations: ['monta', 'monta.hembra'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  // =====================================
  // SECCIÓN DE PARTOS
  // =====================================

  async registrarParto(datos: any, fincaId: number, usuarioId: string) {
    if (!datos.numero_parto || !datos.diagnosticoId) {
      throw new BadRequestException('El número de parto y el ID del diagnóstico son obligatorios.');
    }

    const diag = await this.diagnosticosRepo.findOne({
        where: { id: datos.diagnosticoId },
        relations: ['monta', 'monta.hembra']
    });

    if (!diag || diag.resultado !== 'Positivo') {
        throw new BadRequestException('No se puede registrar un parto de un diagnóstico negativo.');
    }

    const nuevo = this.partosRepo.create({
      ...datos,
      fincaId,
      diagnostico_prenez: { id: datos.diagnosticoId }
    });
    const guardado = await this.partosRepo.save(nuevo);

    // 🔄 AUTOMATIZACIÓN: Al parir, la vaca entra en lactancia
    await this.animalesRepo.update(diag.monta.hembra.animal_id, {
        estado_reproductivo: 'Lactancia'
    } as any);

    await this.notificacionesService.crearAlerta(
        usuarioId,
        'Nuevo Nacimiento Registrado',
        `La vaca ${diag.monta.hembra.nombre} ha parido exitosamente. Estado actualizado a Lactancia.`,
        'sistema',
        'reproduccion'
    );

    return guardado;
  }

  async obtenerPartos(fincaId: number) {
    return this.partosRepo.find({
      where: { fincaId },
      relations: ['diagnostico_prenez', 'diagnostico_prenez.monta.hembra'],
      order: { fecha_creacion: 'DESC' }
    });
  }
}