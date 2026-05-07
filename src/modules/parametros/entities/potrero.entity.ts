import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';
<<<<<<< Updated upstream
=======
import { Animal } from '../../animales/entities/animal.entity';
>>>>>>> Stashed changes

@Entity('potrero')
export class Potrero {
  @PrimaryGeneratedColumn()
  potrero_id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  ubicacion: string;

  @ManyToOne(() => Finca)
  @JoinColumn({ name: 'finca_id' })
  finca: Finca;

@DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;
}