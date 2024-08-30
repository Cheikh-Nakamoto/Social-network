import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { routeEvent } from './events';


export class Event {
  type: string;
  payload: any;

  constructor(type: string, payload: any = null) {
    this.type = type;
    this.payload = payload;
  }
}


@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.asObservable();
  private userData!: any

  constructor() {
    this.userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(this.userData);
  }

  connect(): void {
    if (this.userData.userId) {
      console.error('User data is missing or invalid');
      return;
    }
    console.log('start');
    const url = `ws://localhost:8080/ws?userId=${this.userData.id}`;

    this.socket$ = new WebSocketSubject(url);

    // Expose the WebSocket on the window object
    (window as any).socket = this.socket$;

    this.socket$.subscribe(
      (message) => {
        console.log('Received message: ', message);
        const parsedMessage =
          typeof message === 'string' ? JSON.parse(message) : message;

        // Récupérer le type et le payload
        const messageType = parsedMessage.type;
        const messagePayload = parsedMessage.payload;

        console.log('Type:', messageType);
        console.log('Payload:', messagePayload);

        // Si vous avez besoin de transformer ce message en un Event pour le routage
        const event = new Event(messageType);
        // Ajoutez éventuellement d'autres propriétés à l'événement
        (event as any).payload = messagePayload;

        // routeEvent(event)
        this.messagesSubject$.next(event);
      },
      (err) => {
        console.error('WebSocket error: ', err);
        this.reconnect();
      },
      () => {
        console.log('WebSocket connection closed');
        this.reconnect();
      }
    );

    console.log('Attempting websocket connection');
  }

  private reconnect(): void {
    setTimeout(() => this.connect(), 5000); // Reconnect after 5 seconds
  }

  sendMessage(msg: any): void {
    if (this.socket$) {
      this.socket$.next(msg);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
