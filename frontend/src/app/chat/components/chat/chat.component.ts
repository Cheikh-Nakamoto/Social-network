import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
// import { Message } from '../../../models/models.compenant';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  message: string="";
  response: string=""


  
  constructor(private chatService: ChatService) {
    
  }

  ngOnInit(): void {
    // Handle connection success
    this.chatService.onConnectionSuccess().subscribe(() => {
      console.log('Connected to the WebSocket server');
    });

    // Handle connection error
    this.chatService.onConnectionError().subscribe((error: any) => {
      console.error('Connection error:', error);
    });

    // Handle disconnection
    this.chatService.onDisconnect().subscribe(() => {
      console.log('Disconnected from the WebSocket server');
    });

    // Handle responses from the server
    this.chatService.receiveStatus().subscribe((response: any) => {
      this.response = response;
      console.log('Received response:', response);
    });
  }

  connect() {
    this.chatService.connectSocket('Your connection message here');
  }

  disconnect() {
    this.chatService.disconnectSocket();
  }

}
