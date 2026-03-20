import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monta } from './entities/monta.entity';
import { DiagnosticoPrenez } from './entities/diagnostico-prenez.entity';
import { Parto } from './entities/parto.entity';
import { Animal } from '../animales/entities/animal.entity';
// Asegúrate de que la ruta de notificaciones sea la correcta en tu proyecto
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

    // Si tu NotificacionesService falla por importación, coméntalo temporalmente
    private readonly notificacionesService: NotificacionesService,
  ) {}

  private getHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  // =====================================
  // SECCIÓN DE MONTAS
  // =====================================

  async registrarMonta(datos: any, fincaId: number) {
    // Usamos los nombres exactos que vienen del frontend ahora
    if (!datos.numero_monta || !datos.animal_hembra_id) {
      throw new BadRequestException(
        'El número de monta y el ID de la hembra son obligatorios.',
      );
    }

    const hembra = await this.animalesRepo.findOneBy({
      animal_id: datos.animal_hembra_id,
    });
    if (!hembra || hembra.sexo !== 'Hembra') {
      throw new BadRequestException(
        'La monta solo puede registrarse en animales de sexo Hembra.',
      );
    }

    // Bloquear si ya tiene un embarazo activo sin parto
    const prenecesActivas = await this.diagnosticosRepo.find({
      where: {
        fincaId,
        resultado: 'Positivo',
        monta: { hembra: { animal_id: datos.animal_hembra_id } },
      },
      relations: ['monta', 'monta.hembra'],
    });

    for (const prenez of prenecesActivas) {
      const tieneParto = await this.partosRepo.findOne({
        where: { diagnostico_prenez: { id: prenez.id } },
      });
      if (!tieneParto) {
        throw new BadRequestException(
          `La vaca ${hembra.nombre || hembra.arete} ya tiene una preñez activa. Registra el parto primero.`,
        );
      }
    }

    const nueva = this.montasRepo.create({
      ...datos,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      hembra: { animal_id: datos.animal_hembra_id },
      macho: datos.animal_macho_id
        ? { animal_id: datos.animal_macho_id }
        : null,
      estado: 'En Evaluación',
    });

    return await this.montasRepo.save(nueva);
  }
  async obtenerMontas(fincaId: number) {
    return this.montasRepo.find({
      where: { fincaId },
      relations: ['hembra', 'macho'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  // 👇 Esta es la función que te faltaba sacar al nivel principal
  async findOne(id: number) {
    const monta = await this.montasRepo.findOne({
      where: { id },
      relations: ['hembra', 'macho'],
    });
    if (!monta) throw new NotFoundException(`Monta #${id} no encontrada`);
    return monta;
  }

  // 👇 Función para actualizar la monta desde el menú de edición del frontend
  async update(id: number, updateData: any) {
    const monta = await this.findOne(id);

    if (updateData.animal_hembra_id)
      monta.hembra = { animal_id: updateData.animal_hembra_id } as Animal;

    // Permitir que se borre el toro si pasa a Inseminación Artificial
    if (updateData.animal_macho_id !== undefined) {
      monta.macho = (
        updateData.animal_macho_id
          ? ({ animal_id: updateData.animal_macho_id } as Animal)
          : null
      ) as any;
    }

    if (updateData.tipo_monta) monta.tipo_monta = updateData.tipo_monta;
    if (updateData.fecha_programacion)
      monta.fecha_programacion = updateData.fecha_programacion;

    // Permitir que se borre o agregue la pajilla
    if (updateData.codigo_pajilla !== undefined) {
      monta.codigo_pajilla = updateData.codigo_pajilla;
    }

    if (updateData.estado) monta.estado = updateData.estado;

    return await this.montasRepo.save(monta);
  }


  // 👇 Función para eliminar una monta (y todo lo que dependa de ella)
  async remove(id: number) {
    const monta = await this.findOne(id);
    
    // Si la vaca estaba "En Evaluación" o "Confirmada", la regresamos a "Vacía"
    if (monta.hembra && (monta.estado === 'En Evaluación' || monta.estado === 'Confirmada')) {
        await this.animalesRepo.update(monta.hembra.animal_id, { estado_reproductivo: 'Vacía' } as any);
    }

    return await this.montasRepo.remove(monta);
  }
  // =====================================
  // SECCIÓN DE DIAGNÓSTICOS
  // =====================================

  async registrarDiagnostico(datos: any, fincaId: number, usuarioId: string) {
    const monta = await this.montasRepo.findOne({
      where: { id: datos.montaId },
      relations: ['hembra'],
    });

    if (!monta) throw new NotFoundException('La monta referenciada no existe.');

    const nuevo = this.diagnosticosRepo.create({
      ...datos,
      fincaId,
      fecha_programacion: datos.fecha_programacion || this.getHoy(),
      monta: { id: datos.montaId },
    });
    const guardado = await this.diagnosticosRepo.save(nuevo);

    // 🔄 AUTOMATIZACIÓN DE ESTADOS
    const estadoVaca = datos.resultado === 'Positivo' ? 'Gestante' : 'Vacía';
    const estadoMonta =
      datos.resultado === 'Positivo' ? 'Confirmada' : 'Fallida';

    // 1. Actualizamos a la Vaca
    await this.animalesRepo.update(monta.hembra.animal_id, {
      estado_reproductivo: estadoVaca,
    } as any);
    // 2. Actualizamos la Monta
    await this.montasRepo.update(monta.id, { estado: estadoMonta });

    try {
      await this.notificacionesService.crearAlerta(
        usuarioId,
        'Diagnóstico Registrado',
        `Vaca ${monta.hembra.arete}: Resultado ${datos.resultado}`,
        'alerta',
        'reproduccion',
      );
    } catch (e) {
      /* Ignorar si falla la notificación */
    }

    return guardado;
  }

  async obtenerDiagnosticos(fincaId: number) {
    return this.diagnosticosRepo.find({
      where: { fincaId },
      relations: ['monta', 'monta.hembra'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  // =====================================
  // SECCIÓN DE PARTOS
  // =====================================

  async registrarParto(datos: any, fincaId: number, usuarioId: string) {
    const diag = await this.diagnosticosRepo.findOne({
      where: { id: datos.diagnosticoId },
      relations: ['monta', 'monta.hembra', 'monta.macho'],
    });

    if (!diag) throw new NotFoundException('Diagnóstico no encontrado.');

    const nuevo = this.partosRepo.create({
      ...datos,
      fincaId,
      diagnostico_prenez: { id: datos.diagnosticoId },
    });
    const guardado = await this.partosRepo.save(nuevo);

    // 🔄 AUTOMATIZACIÓN 1: Actualizamos a la mamá y a la monta
    const nuevoEstadoMadre =
      datos.tipo_parto === 'Aborto' ? 'Vacía' : 'Lactando';
    await this.animalesRepo.update(diag.monta.hembra.animal_id, {
      estado_reproductivo: nuevoEstadoMadre,
    } as any);
    await this.montasRepo.update(diag.monta.id, {
      estado: datos.tipo_parto === 'Aborto' ? 'Aborto' : 'Parto Exitoso',
    });

    // 🌟 AUTOMATIZACIÓN 2: CREAR EL NUEVO TERNERITO DE FORMA SEGURA
    if (datos.tipo_parto !== 'Aborto') {
      const nuevaCria = {
        finca_id: fincaId,
        finca: { id: fincaId },
        arete: `CRIA-${Date.now().toString().slice(-4)}`,
        // 👇 1. Recibimos el nombre que escribiste en la pantalla
        nombre: datos.nombre_animal || `Cría de ${diag.monta.hembra.arete}`,
        // 👇 2. Recibimos el sexo (Macho/Hembra) que seleccionaste
        sexo: (datos.sexo || 'Hembra') as any,
        peso_nacimiento: 35,
        peso_actual: 35,
        fecha_nacimiento: this.getHoy(),
        estado_reproductivo: 'Vacía',
        madre: { animal_id: diag.monta.hembra.animal_id },
        // 👇 3. ¡LA MAGIA! El sistema busca la monta original y le asigna el padre automáticamente
        padre: diag.monta.macho
          ? { animal_id: diag.monta.macho.animal_id }
          : null,
      } as any;

      await this.animalesRepo.save(nuevaCria);
    }

    try {
      await this.notificacionesService.crearAlerta(
        usuarioId,
        'Nuevo Parto',
        `La vaca ${diag.monta.hembra.arete} ha parido.`,
        'sistema',
        'reproduccion',
      );
    } catch (e) {}

    return guardado;
  }

  async obtenerPartos(fincaId: number) {
    return this.partosRepo.find({
      where: { fincaId },
      relations: ['diagnostico_prenez', 'diagnostico_prenez.monta.hembra'],
      order: { fecha_creacion: 'DESC' },
    });
  }
}
