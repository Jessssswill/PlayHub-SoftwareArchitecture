import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameType } from '../../shared/types/game-type.enum';

class PlayerDto {
  @ApiProperty({ description: 'ID unik player' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Nama tampilan player' })
  @IsString()
  name!: string;
}

export class CreateSessionDto {
  @ApiProperty({ enum: GameType, description: 'Tipe game yang dimainkan' })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiProperty({
    type: [PlayerDto],
    description: 'Tepat 2 player yang mengikuti sesi',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  players!: [PlayerDto, PlayerDto];

  @ApiPropertyOptional({
    description: 'Durasi time control dalam detik (0 = tanpa batas)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeControlSeconds?: number;

  @ApiPropertyOptional({
    description: 'Apakah sesi private (hanya bisa diakses dengan ID)',
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ description: 'Izinkan spectator menonton sesi' })
  @IsOptional()
  @IsBoolean()
  allowSpectators?: boolean;
}
