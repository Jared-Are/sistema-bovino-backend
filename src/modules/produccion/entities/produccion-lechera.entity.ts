import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Animal } from '../../animales/entities/animal.entity';

@Entity('produccion_lechera')
export class ProduccionLechera {
  @PrimaryGeneratedColumn()
  id: number;

  // 🛡️ Aislamiento SaaS
  @Column({ name: 'finca_id' })
  fincaId: number;

  // Identificador único (ej: L-2026-001)
  @Column()
  numero_produccion: string;

  // Solo las vacas (hembras) deberían registrar esto
  @ManyToOne(() => Animal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animal_id' })
  animal: Animal;

  // Cantidad en Litros
  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}