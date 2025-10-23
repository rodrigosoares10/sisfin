import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CentroCusto } from './CentroCusto';

export type TipoTransacao = 'receita' | 'despesa';

@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['receita', 'despesa'] })
  tipo: TipoTransacao;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'date' })
  data: Date;

  @Column({ nullable: true })
  centroCustoId?: number;

  @ManyToOne(() => CentroCusto, (centroCusto) => centroCusto.transacoes, {
    nullable: true,
  })
  @JoinColumn({ name: 'centroCustoId' })
  centroCusto?: CentroCusto;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
