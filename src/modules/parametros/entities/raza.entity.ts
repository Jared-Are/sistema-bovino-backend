import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';

@Entity('razas')
export class Raza {
  @PrimaryGeneratedColumn()
  raza_id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Finca)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}