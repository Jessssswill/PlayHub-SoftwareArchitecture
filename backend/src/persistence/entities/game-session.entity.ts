import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('game_sessions')
export class GameSessionEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  gameType!: string;

  @Column('varchar')
  status!: string;

  @Column('text')
  playersJson!: string;

  @Column('text', { nullable: true })
  currentStateJson!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('int', { default: 0 })
  timeControlSeconds!: number;

  @Column('boolean', { default: false })
  isPrivate!: boolean;

  @Column('boolean', { default: false })
  allowSpectators!: boolean;

  @Column('int', { default: 0 })
  maxSpectators!: number;
}
