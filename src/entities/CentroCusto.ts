import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transacao } from './Transacao';

@Entity('centros_custo')
export class CentroCusto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Transacao, (transacao) => transacao.centroCusto)
  transacoes: Transacao[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
