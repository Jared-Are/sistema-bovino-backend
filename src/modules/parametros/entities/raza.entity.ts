import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Finca } from '../../fincas/entities/finca.entity';
import { Animal } from '../../animales/entities/animal.entity'; 

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

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;

  @OneToMany(() => Animal, animal => animal.raza)
  animales: Animal[];

}