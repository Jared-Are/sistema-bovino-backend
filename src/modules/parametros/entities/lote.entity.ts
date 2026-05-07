import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
import { Animal } from '../../animales/entities/animal.entity';
>>>>>>> Stashed changes
=======
import { Animal } from 'src/modules/animales/entities/animal.entity';
>>>>>>> main

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
  @OneToMany(() => Animal, animal => animal.lote)
  animales: Animal[];
}