import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';

@Entity('lote')
export class Lote {
  @PrimaryGeneratedColumn()
  lote_id: number;

  @Column({ length: 100 })
  nombre: string;

  @ManyToOne(() => Finca)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}