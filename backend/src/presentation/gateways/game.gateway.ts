import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEventBus } from '../../business/events/game-event-bus';

/**
 * @pattern Observer (Presentation Entry)
 * @intent Subscribe ke GameEventBus (global domain event stream), forward
 *         event ke WebSocket clients (players + spectators) real-time.
 *         Setiap sesi punya room sendiri: "session:<id>".
 *         Client harus emit 'subscribe' dengan sessionId untuk masuk room.
 * @participants GameEventBus (subject), Socket.io clients (concrete observers)
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly eventBus: GameEventBus) {}

  /**
   * Dipanggil setelah WebSocket server di-init — saat ini server sudah siap.
   * Subscribe ke global event bus untuk broadcast ke room.
   */
  afterInit(server: Server): void {
    this.eventBus.on('move.applied', (p) =>
      server.to(`session:${p.sessionId}`).emit('move', p),
    );
    this.eventBus.on('state.changed', (p) =>
      server.to(`session:${p.sessionId}`).emit('state', p),
    );
    this.eventBus.on('player.joined', (p) =>
      server.to(`session:${p.sessionId}`).emit('joined', p),
    );
    this.eventBus.on('game.finished', (p) =>
      server.to(`session:${p.sessionId}`).emit('finished', p),
    );
  }

  handleConnection(client: Socket): void {
    client.emit('connected', { socketId: client.id });
  }

  handleDisconnect(_client: Socket): void {
    // no-op — Socket.io mengelola room cleanup otomatis saat disconnect
  }

  /** Client subscribe ke room sesi tertentu untuk menerima event real-time. */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ): { subscribed: boolean; room: string } {
    const room = `session:${data.sessionId}`;
    client.join(room);
    return { subscribed: true, room };
  }

  /** Client keluar dari room sesi. */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ): { unsubscribed: boolean } {
    client.leave(`session:${data.sessionId}`);
    return { unsubscribed: true };
  }
}
