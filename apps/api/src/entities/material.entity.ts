import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('materials')
export class Material {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
