import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private webSocket: Socket) {}

  // This method is used to start connection/handshake of socket with server
  connectSocket(message: string) {
    this.webSocket.emit('connect', message);
  }

  // This method is used to get response from server
  receiveStatus(): Observable<any> {
    return this.webSocket.fromEvent<any>('/get-response');
  }

  // This method is used to end web socket connection
  disconnectSocket() {
    this.webSocket.disconnect();
  }

  // This method is used to handle connection success event
  onConnectionSuccess(): Observable<any> {
    return this.webSocket.fromEvent('connect');
  }

  // This method is used to handle connection error event
  onConnectionError(): Observable<any> {
    return this.webSocket.fromEvent('connect_error');
  }

  // This method is used to handle disconnection event
  onDisconnect(): Observable<any> {
    return this.webSocket.fromEvent('disconnect');
  }
}