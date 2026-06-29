import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakeMoveDto {
  @ApiProperty({ description: 'ID player yang melakukan move' })
  @IsString()
  playerId!: string;

  @ApiProperty({
    description:
      'Data move sesuai game type. TicTacToe: { gameType, row, col }. Chess: { gameType, from: {row,col}, to: {row,col} }',
    type: Object,
  })
  @IsObject()
  move!: Record<string, unknown>;
}
