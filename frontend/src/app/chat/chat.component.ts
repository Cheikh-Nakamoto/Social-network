// my-component.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/chat.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
// import { Event } from './services/events';
import { ActivatedRoute } from '@angular/router';
import * as model from '../models/models.compenant';
import { DataService } from '../data.service';
import { HttpClientModule } from '@angular/common/http';
import { GetUserService } from '../data.service';
import { ToolbarComponent } from '../nav/toolbar/toolbar.component';
import { SidenavComponent } from '../nav/sidenav/sidenav.component';


@Component({
  selector: 'chat-app',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    HttpClientModule,
    ToolbarComponent,
    SidenavComponent
 
  ], // Ajouter CommonModule ici
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DataService],
})
export class ChatComponent implements OnInit, OnDestroy {
  private messagesSubscription!: Subscription;
  public messages: any[] = [];
  user!: model.UserDTO;
  private id!: number;
  sender!: number;
  amount = 10;
  scrollEnd = false;
  scrolling = false;
  scrollHeightBeforeLoad = 0;

  constructor(
    private websocketService: WebSocketService,
    private route: ActivatedRoute,
    private apiservice: DataService,
    private userService: GetUserService
  ) {
    route.queryParams.subscribe((params) => {
      this.id = params['userid'];
    });
  }

  ngOnInit(): void {
    this.userService.user.subscribe((user) => {
      this.sender = user;
      console.log('rrrrrrrrrrrrrrrrrrrrr', this.sender);
    });
    this.getUserById(this.id);
    this.websocketService.connect();

    this.messagesSubscription = this.websocketService.messages$.subscribe(
      (message) => {
        this.messages.push(message);

        if (message.type === 'get_messages') {
          console.log('hlllllllllllllllll', message);
          updateMessages(message.payload.messages, Number(this.id));
        }

        if (message.type === 'new_message') {
          const payload = {
            currentChatterId: this.sender,
            otherChatterId: Number(this.id),
            amount: this.amount,
          };

          const evenget = new Event('get_messages', payload);
          sendEvent(this.websocketService, evenget);
        }
      }
    );

    this.loadAdditionalMessages();
  }

  ngOnDestroy(): void {
    this.messagesSubscription.unsubscribe();
    this.websocketService.close();
  }

  sendMessage(msg: string): void {
    this.websocketService.sendMessage({ content: msg });
  }

  getUserById(id: number): void {
    const userId = JSON.parse(localStorage.getItem('userId') || '{}');

    // Vérifiez si l'ID utilisateur existe dans localStorage
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return;
    }

    this.apiservice.getData('allusers').subscribe(
      (response: model.UserDTO[]) => {
        // Utilisez `find` pour rechercher directement l'utilisateur avec l'ID correspondant
        const foundUser = response.find(
          (user) => user != null && user.id === Number(id)
        );

        if (foundUser) {
          this.user = foundUser;
          console.log('Utilisateur trouvé:', this.user);
        } else {
          console.warn('Utilisateur non trouvé avec ID:', id);
          // Gérez le cas où l'utilisateur n'est pas trouvé
          this.user = {} as model.UserDTO; // Assigner une valeur par défaut vide ou gérer autrement
        }
      },
      (error) => {
        console.error(
          'Erreur lors de la récupération des utilisateurs:',
          error
        );
      }
    );
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault(); // Empêche le rechargement de la page
    const messagetag = (event.target as HTMLFormElement).querySelector(
      '#msgContent'
    ) as HTMLTextAreaElement;
    const messageContent = messagetag.value;

    const messBody: model.MessageBody = {
      senderId: this.sender,
      receiverId: Number(this.id),
      message: messageContent,
    };

    const message: model.MessageData = {
      type: 'send_message',
      datas: messBody,
    };

    const even = new Event(message.type, message.datas);

    sendEvent(this.websocketService, even);
    const updateEve = new Event('get_chatbar_data', this.sender);
    sendEvent(this.websocketService, updateEve);
    const payload = {
      currentChatterId: this.sender,
      otherChatterId: Number(this.id),
      amount: this.amount,
    };

    const evenget = new Event('get_messages', payload);
    sendEvent(this.websocketService, evenget);

    // Réinitialiser le champ de texte après l'envoi
    messagetag.value = '';
  }

  loadAdditionalMessages() {
    console.log('contacted');
    const chatBox = document.getElementById('chatBox');
    console.log('cccccccccc', chatBox);

    if (
      chatBox &&
      chatBox.scrollTop === 0 &&
      !this.scrollEnd &&
      !this.scrolling
    ) {
      this.amount += 10;
      this.scrollHeightBeforeLoad = chatBox.scrollHeight;

      this.scrolling = true;
      const payload = {
        currentChatterId: this.sender,
        otherChatterId: Number(this.id),
        amount: this.amount,
      };

      const even = new Event('get_messages', payload);
      sendEvent(this.websocketService, even);
    }
  }
}

class Event {
  type: string;
  payload: any;

  constructor(type: string, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}

// function getMessages (currentChatterId: number, otherChatterId: number, amount: number){
//     const payload = {
//         currentChatterId,
//         otherChatterId,
//         amount
//   }

// }

function sendEvent(websocketService: WebSocketService, datas: any) {
  websocketService.sendMessage(datas);
}

const updateMessages = (messages: any, receiverId: number) => {
  const chatBox = document.getElementById('chatBox');
  if (chatBox) {
    chatBox.innerHTML = '';

    var msgType, prevMsg, prevMsgType;

    messages.forEach((message: any) => {
      if (message.receiverId != receiverId) {
        msgType = 'Received';
      } else {
        msgType = 'Sent';
      }

      chatBox.innerHTML += `
                <div class="messageContainer ${
                  msgType === 'Received' ? 'received' : 'sent'
                }">
                    <div id="msgBox" class="msgBox${msgType}" data-linked="${
        message.messageId
      }">
                        <a style="font-size: 15px; white-space: pre-wrap;">${message.message.trim()}</a>
                    </div>
                    <div id="timeBox" class="timeBox${msgType}" data-link="${
        message.messageId
      }">
                        <a>${message.sentDate}</a>
                    </div>
                </div>
            `;

      prevMsg = message;
      prevMsgType = msgType;
    });

    addHoverListeners();
  }
};

const addHoverListeners = (): void => {
  const hoveredDivs = document.querySelectorAll<HTMLElement>('#msgBox');
  const timeBoxes = document.querySelectorAll<HTMLElement>('#timeBox');
  timeBoxes.forEach((timeBox) => {
    timeBox.style.visibility = 'hidden';
  });

  hoveredDivs.forEach((hoveredDiv) => {
    hoveredDiv.addEventListener('mouseenter', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkedId = target.getAttribute('data-linked');
      if (linkedId) {
        const linkedDiv = document.querySelector<HTMLElement>(
          `#timeBox[data-link="${linkedId}"]`
        );

        if (linkedDiv) {
          // Change the style of the linked div
          linkedDiv.style.visibility = 'visible';
        }
      }
    });

    hoveredDiv.addEventListener('mouseleave', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkedId = target.getAttribute('data-linked');
      if (linkedId) {
        const linkedDiv = document.querySelector<HTMLElement>(
          `#timeBox[data-link="${linkedId}"]`
        );

        if (linkedDiv) {
          // Reset the style of the linked div
          linkedDiv.style.visibility = 'hidden';
        }
      }
    });
  });
};
