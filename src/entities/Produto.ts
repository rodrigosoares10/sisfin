import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precoRecorrente?: number; // Para cálculo de MRR (Monthly Recurring Revenue)

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'int', default: 0 })
  quantidadeEstoque: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
