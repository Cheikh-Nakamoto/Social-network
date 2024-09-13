import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { routeEvent } from './events';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '../chat.component';


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
  private userId !: string

  constructor() {
    this.userId = JSON.parse(localStorage.getItem('userID') || '{}');
  }

  connect(): void {


    if (!this.userId) {
      console.error('User data is missing or invalid');
      return;
    }
    const url = `ws://localhost:8080/ws?userId=${this.userId}`;
    this.socket$ = new WebSocketSubject(url);
    // Expose the WebSocket on the window object
    (window as any).socket = this.socket$;

    this.socket$.subscribe(
      (message) => {
        const parsedMessage =
          typeof message === 'string' ? JSON.parse(message) : message;

        // Récupérer le type et le payload
        const messageType = parsedMessage.type;
        const messagePayload = parsedMessage.payload;


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
        this.reconnect();
      }
    );

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




@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private dialog: MatDialog) {}

    // Ouvrir un dialogue si non déjà ouvert
    openCreatePostDialog(id: number): void {
        const isDialogOpen = this.isDialogAlreadyOpen(id);

        if (!isDialogOpen) {
            this.dialog.open(ChatComponent, {
                width: '400px',
                data: { userId: id }, // Envoi de paramètres au composant de la boîte de dialogue
                position: {
                    bottom: '12px',
                    right: '6px',
                },
            });
        } else {
            console.log('Le dialogue est déjà ouvert');
        }
    }

    // Vérifier si le dialogue est déjà ouvert pour cet utilisateur
    isDialogAlreadyOpen(userId: number): boolean {
        const openDialogs = this.dialog.openDialogs;

        return openDialogs.some((dialog) => {
            const data = dialog.componentInstance.data;
            return data && data.userId === userId;
        });
    }
}
