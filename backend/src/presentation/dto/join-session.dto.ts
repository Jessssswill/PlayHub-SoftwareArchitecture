import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinSessionDto {
  @ApiProperty({ description: 'ID unik player yang bergabung' })
  @IsString()
  playerId!: string;

  @ApiProperty({ description: 'Nama tampilan player' })
  @IsString()
  playerName!: string;
}
