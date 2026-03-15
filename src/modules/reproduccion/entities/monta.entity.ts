import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity'; // Asegúrate de la ruta

@Entity('montas')
export class Monta {
  @PrimaryGeneratedColumn()
  id: number;

  // Aislamiento SaaS
  @Column({ name: 'finca_id' })
  fincaId: number;

  @Column()
  numero_monta: string; // Ej: "M-2026-001"

  @Column()
  tipo_monta: string; // 'Natural' o 'Artificial'

  @Column({ default: 'Programada' })
  estado: string; // 'Programada', 'Realizada', 'Fallida'

  @Column({ type: 'date', nullable: true })
  fecha_programacion: string;

  // --- RELACIONES ---
  // La vaca (Obligatorio)
  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_hembra_id' })
  hembra: Animal;

  // El toro (Opcional, puede ser inseminación artificial sin toro registrado)
  @ManyToOne(() => Animal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'animal_macho_id' })
  macho: Animal;

  @CreateDateColumn()
  fecha_creacion: Date;
}