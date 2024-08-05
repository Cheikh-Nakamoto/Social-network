// my-component.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/chat.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Event } from './services/events';

@Component({
  selector: 'chat-app',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet], // Ajouter CommonModule ici
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private messagesSubscription!: Subscription;
  public messages: any[] = [];

  constructor(private websocketService: WebSocketService) {}

  ngOnInit(): void {
    this.messagesSubscription = this.websocketService.messages$.subscribe(
      (message) => {
        this.messages.push(message);
        console.log(message)
      }
    );
  }

  ngOnDestroy(): void {
    this.messagesSubscription.unsubscribe();
    this.websocketService.close();
  }

  sendMessage(msg: string): void {
    this.websocketService.sendMessage({ content: msg });
  }
}
