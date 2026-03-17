import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';

@Entity('tipo_tratamientos')
export class TipoTratamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ name: 'finca_id' })
  finca_id: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fecha_eliminacion: Date;

  @ManyToOne(() => Finca)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;
}