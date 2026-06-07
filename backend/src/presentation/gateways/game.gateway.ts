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

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly eventBus: GameEventBus) {}

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
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ): { subscribed: boolean; room: string } {
    const room = `session:${data.sessionId}`;
    client.join(room);
    return { subscribed: true, room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ): { unsubscribed: boolean } {
    client.leave(`session:${data.sessionId}`);
    return { unsubscribed: true };
  }
}
