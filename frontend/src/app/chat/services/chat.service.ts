import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
  

  
export class WebSocketService {
    
person:{
  userId: number,
  name: string,
}

  private socket$!: WebSocketSubject<any>;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.asObservable();

  constructor() {
    this.person = {
      userId:10,
      name:"Serigne fallou"
    }
    localStorage.setItem("userData",JSON.stringify(this.person))
    this.connect();
  }

  connect(): void {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    console.log(userData)
    const url = `ws://localhost:8080/ws?userId=${userData.userId}`;

    this.socket$ = new WebSocketSubject(url);

    this.socket$.subscribe(
      (message) => {
        console.log('Received message: ', message);
          const event: Event = message; // ici je définie le messasage reçu ainsi pret pour le routage
          // routeEvent(event);
         this.messagesSubject$.next(message);
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
    this.socket$.next(msg);
  }

  close(): void {
    this.socket$.complete();
  }
}
