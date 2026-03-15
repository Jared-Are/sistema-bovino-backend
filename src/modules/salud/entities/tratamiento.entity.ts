import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string; // Ej: "Antibiótico", "Desparasitante", "Vitamina"

  @Column()
  veterinario: string; // Quién lo aplicó

  @Column({ default: 'activo' })
  estado: string; // 'activo', 'completado', 'suspendido'

  @Column({ type: 'date' })
  fecha: string;

  // --- RELACIONES ---
  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  // Aislamiento SaaS
  @Column({ name: 'finca_id' })
  fincaId: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}