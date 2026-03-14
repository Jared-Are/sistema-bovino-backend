import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('finca')
export class Finca {
  @PrimaryGeneratedColumn()
  finca_id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 255, nullable: true })
  ubicacion: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_creacion: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_eliminacion: Date;

  // CAMBIO AQUÍ: Usamos un string 'Usuario' en lugar de la clase directa
  // y quitamos el tipo explícito para la inicialización
  @OneToMany('Usuario', 'finca') 
  usuarios: any[]; 
}