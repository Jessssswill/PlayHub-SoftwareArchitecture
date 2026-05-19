import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GameEngineAuthorizationProxy } from '../../persistence/proxies/authorization.proxy';
import { CachedGameStateProxy } from '../../persistence/proxies/cached-game-state.proxy';
import { GameSession } from '../../business/domain/game-session';
import { GameType } from '../../shared/types/game-type.enum';
import { GameStatus } from '../../shared/types/game-status.enum';
import { Player } from '../../shared/types/player.interface';
import { Move } from '../../shared/types/move.types';
import { CreateSessionDto } from '../dto/create-session.dto';
import { JoinSessionDto } from '../dto/join-session.dto';
import { MakeMoveDto } from '../dto/make-move.dto';

@ApiTags('sessions')
@Controller('sessions')
export class SessionController {
  constructor(
    private readonly proxy: GameEngineAuthorizationProxy,
    private readonly cacheProxy: CachedGameStateProxy,
  ) {}

  // ── POST /sessions ──────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Buat sesi game baru dengan 2 player' })
  @ApiResponse({ status: 201, description: 'Sesi berhasil dibuat dan langsung IN_PROGRESS' })
  @ApiResponse({ status: 400, description: 'Payload tidak valid' })
  async createSession(@Body() dto: CreateSessionDto) {
    const session = await this.proxy.createSession(
      dto.gameType,
      dto.players as [Player, Player],
    );
    return this.serialize(session);
  }

  // ── POST /sessions/demo ─────────────────────────────────────────────────────

  @Post('demo')
  @ApiOperation({
    summary: 'Demo: buat sesi TicTacToe dengan 2 dummy player dan 3 move pre-played',
  })
  @ApiResponse({ status: 201, description: 'Sesi demo berhasil dibuat' })
  async demoSession() {
    const players: [Player, Player] = [
      { id: 'demo-alice', name: 'Demo Alice' },
      { id: 'demo-bob', name: 'Demo Bob' },
    ];
    const session = await this.proxy.createSession(GameType.TIC_TAC_TOE, players);

    // 3 pre-played moves: Alice(0,0) → Bob(1,1) → Alice(0,1)
    await this.proxy.makeMove(session.id, 'demo-alice', {
      gameType: GameType.TIC_TAC_TOE,
      playerId: 'demo-alice',
      row: 0,
      col: 0,
    } as Move);
    await this.proxy.makeMove(session.id, 'demo-bob', {
      gameType: GameType.TIC_TAC_TOE,
      playerId: 'demo-bob',
      row: 1,
      col: 1,
    } as Move);
    await this.proxy.makeMove(session.id, 'demo-alice', {
      gameType: GameType.TIC_TAC_TOE,
      playerId: 'demo-alice',
      row: 0,
      col: 1,
    } as Move);

    const state = await this.cacheProxy.getState(session.id);
    return { sessionId: session.id, state };
  }

  // ── GET /sessions ───────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List semua sesi aktif, opsional filter berdasarkan status' })
  @ApiQuery({ name: 'status', enum: GameStatus, required: false })
  @ApiResponse({ status: 200, description: 'Daftar sesi' })
  listSessions(@Query('status') status?: string) {
    const all = this.proxy.listSessions();
    const filtered = status ? all.filter((s) => s.status === status) : all;
    return filtered.map((s) => this.serialize(s));
  }

  // ── GET /sessions/:id ───────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Ambil game state sesi (via caching proxy)' })
  @ApiParam({ name: 'id', description: 'ID sesi' })
  @ApiResponse({ status: 200, description: 'Game state saat ini' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  async getState(@Param('id') id: string) {
    return this.cacheProxy.getState(id);
  }

  // ── POST /sessions/:id/join ─────────────────────────────────────────────────

  @Post(':id/join')
  @ApiOperation({ summary: 'Bergabung ke sesi sebagai player atau spectator' })
  @ApiParam({ name: 'id', description: 'ID sesi' })
  @ApiResponse({ status: 201, description: 'Berhasil bergabung' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  async joinSession(@Param('id') id: string, @Body() dto: JoinSessionDto) {
    await this.proxy.joinSession(id, { id: dto.playerId, name: dto.playerName });
    return { joined: true, sessionId: id };
  }

  // ── DELETE /sessions/:id ────────────────────────────────────────────────────

  @Delete(':id')
  @ApiOperation({ summary: 'Akhiri sesi (hanya anggota sesi yang bisa)' })
  @ApiParam({ name: 'id', description: 'ID sesi' })
  @ApiQuery({ name: 'requesterId', description: 'ID player yang mengakhiri sesi', required: true })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diakhiri' })
  @ApiResponse({ status: 403, description: 'Bukan anggota sesi' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  async endSession(
    @Param('id') id: string,
    @Query('requesterId') requesterId: string,
  ) {
    await this.proxy.endSession(id, requesterId);
    return { ended: true, sessionId: id };
  }

  // ── POST /sessions/:id/move ─────────────────────────────────────────────────

  @Post(':id/move')
  @ApiOperation({
    summary: 'Kirim move (Authorization Proxy → MoveValidationService → Facade)',
  })
  @ApiParam({ name: 'id', description: 'ID sesi' })
  @ApiResponse({ status: 201, description: 'Move berhasil dieksekusi' })
  @ApiResponse({ status: 400, description: 'Move tidak valid atau bukan giliran Anda' })
  @ApiResponse({ status: 403, description: 'Bukan anggota sesi' })
  async makeMove(@Param('id') id: string, @Body() dto: MakeMoveDto) {
    // Gabungkan playerId ke dalam move agar sesuai discriminated union Move
    const move = { ...dto.move, playerId: dto.playerId } as unknown as Move;
    return this.proxy.makeMove(id, dto.playerId, move);
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private serialize(session: GameSession) {
    return {
      id: session.id,
      gameType: session.gameType,
      status: session.status,
      players: session.players,
      currentState: session.currentState,
      createdAt: session.createdAt,
      timeControlSeconds: session.timeControlSeconds,
      isPrivate: session.isPrivate,
      allowSpectators: session.allowSpectators,
    };
  }
}
