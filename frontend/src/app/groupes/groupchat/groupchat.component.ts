import { Component, Inject, ViewEncapsulation } from '@angular/core';
import * as model from '../../models/models.compenant';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../chat/services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService, GetUserService } from '../../data.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { PickerModule } from '@ctrl/ngx-emoji-mart'



class Event {
    type: string;
    payload: any;

    constructor(type: string, payload: any) {
        this.type = type;
        this.payload = payload;
    }
}

@Component({
    selector: 'app-groupchat',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule, PickerModule],
    templateUrl: './groupchat.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrl: './groupchat.component.scss',
    providers: [DataService],
})
export class GroupchatComponent {
    groups: model.Group[] = [];
    groupeForm!: FormGroup;
    id!: string;
    public groupId!: number;
    clear!: any;
    Events!: model.Eventtype[];
    AllUser: model.AllUsersDTO = {};
    private messagesSubscription!: Subscription;
    private isThrottled: boolean = false;
    user!: model.UserDTO;
    sender!: number;
    scrollEnd = false;
    scrolling = false;
    scrollHeightBeforeLoad = 0;
    amount: number = 10;
    showEmojiPicker = false;
    private processedMessages = new Set<string>();

    constructor(
        private websocketService: WebSocketService,
        private dialogRef: MatDialogRef<GroupchatComponent>,
        private route: ActivatedRoute,
        private userService: GetUserService,
        private apiService: DataService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // route.queryParams.subscribe((params) => {
        //     this.groupId = params['groupId'];
        // });
        this.groupId = data.groupId;
    } // private apiservice: DataService,
    //
    ngOnInit(): void {
        this.userService.user.subscribe((user) => {
            this.sender = user;
        });
        this.websocketService.connect();
        let id = 0

        this.messagesSubscription = this.websocketService.messages$.subscribe(
            (message) => {
                console.log(message.payload.senderId != id);
                if (message.type === 'get_messages_groupes') {

                    this.throttleUpdateMessages(
                        message.payload.messages,
                        Number(this.groupId),
                        this.sender
                    );
                }
                if (message.type === 'new_message_group' && message.payload.messageId != id) {

                    const messageId = message.payload.messageId;

                    if (!this.processedMessages.has(messageId)) {
                        // Si le message n'a pas encore été traité

                        this.NewupdateMessages(message.payload, this.sender);

                        // Marque le message comme traité
                        this.processedMessages.add(messageId);
                    } else {
                        console.log('Message déjà traité, ignoré');
                    }
                }
            }
        );

        this.loadAdditionalMessages();
    }
    closeDialog() {
        this.dialogRef.close();
    }

    throttleUpdateMessages(messages: any, receiverId: number, iduser: number) {
        // Si la fonction est déjà en attente d'exécution, on ignore les nouveaux appels
        if (this.isThrottled) {
            return;
        }

        // Exécuter la fonction
        this.updateMessages(messages, receiverId, iduser);

        // Verrouiller l'exécution pendant un court laps de temps (par exemple, 200ms)
        this.isThrottled = true;

        // Déverrouiller après 200ms pour permettre une nouvelle exécution
        setTimeout(() => {
            this.isThrottled = false;
        }, 50); // Ajuste la durée selon tes besoins
    }
    throttleUpdateNewMessages(messages: any, iduser: number) {
        // Si la fonction est déjà en attente d'exécution, on ignore les nouveaux appels
        if (this.isThrottled) {
            return;
        }

        // Exécuter la fonction
        this.NewupdateMessages(messages, iduser);

        // Verrouiller l'exécution pendant un court laps de temps (par exemple, 200ms)
        this.isThrottled = true;

        // Déverrouiller après 200ms pour permettre une nouvelle exécution
        setTimeout(() => {
            this.isThrottled = false;
        }, 50); // Ajuste la durée selon tes besoins
    }

    NewupdateMessages = (message: any, iduser: number) => {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            var prevMsg, prevMsgType;
            const isAtBottom =
                chatBox.scrollHeight - chatBox.scrollTop ===
                chatBox.clientHeight;
            // const newMessageHTML = ``
            // chatBox.innerHTML = '';

            var msgType: string;
            // messages.forEach((message: any) => {

            if (Number(message.senderId) == iduser) {
                msgType = 'Sent';
            } else {
                msgType = 'Received';
            }
            // console.log("llllllll", msgType)
            // console.log("bbbb",msgType === 'Received' ? 'received' : 'sent');

            let username: string;
            this.getNicknameById(message.senderId, (nickname) => {
                if (nickname) {
                    // console.log('Nickname:', nickname);
                    username = nickname;

                    const newMessageHTML = `
      <div class="messageContainer ${msgType === 'Received' ? 'received' : 'sent'
                        }">
      <span><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#48752C"><path d="M226-262q59-42.33 121.33-65.5 62.34-23.17 132.67-23.17 70.33 0 133 23.17T734.67-262q41-49.67 59.83-103.67T813.33-480q0-141-96.16-237.17Q621-813.33 480-813.33t-237.17 96.16Q146.67-621 146.67-480q0 60.33 19.16 114.33Q185-311.67 226-262Zm253.88-184.67q-58.21 0-98.05-39.95Q342-526.58 342-584.79t39.96-98.04q39.95-39.84 98.16-39.84 58.21 0 98.05 39.96Q618-642.75 618-584.54t-39.96 98.04q-39.95 39.83-98.16 39.83ZM480.31-80q-82.64 0-155.64-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.51T80-480.18q0-82.82 31.5-155.49 31.5-72.66 85.83-127Q251.67-817 324.51-848.5T480.18-880q82.82 0 155.49 31.5 72.66 31.5 127 85.83Q817-708.33 848.5-635.65 880-562.96 880-480.31q0 82.64-31.5 155.64-31.5 73-85.83 127.34Q708.33-143 635.65-111.5 562.96-80 480.31-80Zm-.31-66.67q54.33 0 105-15.83t97.67-52.17q-47-33.66-98-51.5Q533.67-284 480-284t-104.67 17.83q-51 17.84-98 51.5 47 36.34 97.67 52.17 50.67 15.83 105 15.83Zm0-366.66q31.33 0 51.33-20t20-51.34q0-31.33-20-51.33T480-656q-31.33 0-51.33 20t-20 51.33q0 31.34 20 51.34 20 20 51.33 20Zm0-71.34Zm0 369.34Z"/></svg>
      ${username}
      </span>
      </div>
                <div class="messageContainer ${msgType === 'Received' ? 'received' : 'sent'
                        }">
                    <div id="msgBox" class="msgBox${msgType}" data-linked="${message.messageId
                        }">
                        <a style="font-size: 15px; white-space: pre-wrap;">${message.message.trim()}</a>
                    </div>
                    <div id="timeBox" class="timeBox${msgType}" data-link="${message.messageId
                        }">
                        <a>${message.sentDate}</a>
                    </div>
                </div>
            `;
                    chatBox.innerHTML += newMessageHTML;
                } else {
                    console.log('Utilisateur non trouvé');
                }
            });
            // });

            // prevMsg = message;
            // prevMsgType = msgType;

            addHoverListeners();
            if (isAtBottom) {
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    };

    toggleEmojiPicker(): void {
        // Affiche ou masque le picker d'emojis
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    addEmoji(event: any): void {
        // Ajoute l'emoji au textarea
        const textarea = document.getElementById(
            'msgContent'
        ) as HTMLTextAreaElement;
        if (textarea) {
            textarea.value += event.emoji.native;
        }
        this.showEmojiPicker = false; // Masque le picker après sélection
    }

    loadAdditionalMessages() {
        const chatBox = document.getElementById('chatBox');
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
                otherChatterId: Number(this.groupId),
                amount: this.amount,
            };

            const even = new Event('get_messages_groupes', payload);
            sendEvent(this.websocketService, even);
        }
    }

    onSubmit(event: SubmitEvent) {
        event.preventDefault(); // Empêche le rechargement de la page
        const messagetag = (event.target as HTMLFormElement).querySelector(
            '#msgContent'
        ) as HTMLTextAreaElement;
        const messageContent = messagetag.value;
        if (messageContent.trim() === '') {
            return;
        }

        const messBody: model.MessageBody = {

            senderId: this.sender,
            receiverId: Number(this.groupId),
            message: messageContent,

        };

        const message: model.MessageData = {
            type: 'send_message_groupes',
            datas: messBody,
        };
        const even = new Event(message.type, message.datas);

        sendEvent(this.websocketService, even);
        // const updateEve = new Event('get_chatbar_data', this.sender);
        // sendEvent(this.websocketService, updateEve);
        if (this.processedMessages instanceof Set) {
            // Convertir en tableau et récupérer le dernier élément
            const lastMessageId = Array.from(this.processedMessages).pop();

            if (lastMessageId) {

                if (!this.processedMessages.has(lastMessageId + 1)) {

                    this.NewupdateMessages(messBody, this.sender);
                } else {
                    console.log('Message déjà traité, ignoré');
                }

                // console.log('Dernier messageId traité :', lastMessageId+1);
            }

        }

        // Réinitialiser le champ de texte après l'envoi
        messagetag.value = '';
    }

    getNicknameById(
        id: number,
        callback: (nickname: string | null) => void
    ): void {
        this.apiService.getData('allusers').subscribe(
            (response: any) => {
                // Recherche l'utilisateur correspondant à l'ID
                const foundUser = response.users.find(
                    (user: any) => user != null && user.id === id
                );

                if (foundUser) {
                    callback(foundUser.nickname); // Appelle le callback avec le nickname
                } else {
                    console.warn('Utilisateur non trouvé avec ID:', id);
                    callback(null); // Appelle le callback avec null si non trouvé
                }
            },
            (error) => {
                console.error(
                    'Erreur lors de la récupération des utilisateurs:',
                    error
                );
                callback(null); // Appelle le callback avec null en cas d'erreur
            }
        );
    }

    updateMessages = (messages: any, receiverId: number, iduser: number) => {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.innerHTML = '';

            var prevMsg, prevMsgType;

            messages.forEach((message: any) => {
                var msgType: string;
                if (Number(message.senderId) == iduser) {
                    msgType = 'Sent';
                } else {
                    msgType = 'Received';
                }

                let username: string;
                this.getNicknameById(message.senderId, (nickname) => {
                    if (nickname) {
                        username = nickname;

                        chatBox.innerHTML += `
      <div class="messageContainer ${msgType === 'Received' ? 'received' : 'sent'
                            }">
      <span><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#48752C"><path d="M226-262q59-42.33 121.33-65.5 62.34-23.17 132.67-23.17 70.33 0 133 23.17T734.67-262q41-49.67 59.83-103.67T813.33-480q0-141-96.16-237.17Q621-813.33 480-813.33t-237.17 96.16Q146.67-621 146.67-480q0 60.33 19.16 114.33Q185-311.67 226-262Zm253.88-184.67q-58.21 0-98.05-39.95Q342-526.58 342-584.79t39.96-98.04q39.95-39.84 98.16-39.84 58.21 0 98.05 39.96Q618-642.75 618-584.54t-39.96 98.04q-39.95 39.83-98.16 39.83ZM480.31-80q-82.64 0-155.64-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.51T80-480.18q0-82.82 31.5-155.49 31.5-72.66 85.83-127Q251.67-817 324.51-848.5T480.18-880q82.82 0 155.49 31.5 72.66 31.5 127 85.83Q817-708.33 848.5-635.65 880-562.96 880-480.31q0 82.64-31.5 155.64-31.5 73-85.83 127.34Q708.33-143 635.65-111.5 562.96-80 480.31-80Zm-.31-66.67q54.33 0 105-15.83t97.67-52.17q-47-33.66-98-51.5Q533.67-284 480-284t-104.67 17.83q-51 17.84-98 51.5 47 36.34 97.67 52.17 50.67 15.83 105 15.83Zm0-366.66q31.33 0 51.33-20t20-51.34q0-31.33-20-51.33T480-656q-31.33 0-51.33 20t-20 51.33q0 31.34 20 51.34 20 20 51.33 20Zm0-71.34Zm0 369.34Z"/></svg>
      ${username}
      </span>
      </div>
                <div class="messageContainer ${msgType === 'Received' ? 'received' : 'sent'
                            }">
                    <div id="msgBox" class="msgBox${msgType}" data-linked="${message.messageId
                            }">
                        <a style="font-size: 15px; white-space: pre-wrap;">${message.message.trim()}</a>
                    </div>
                    <div id="timeBox" class="timeBox${msgType}" data-link="${message.messageId
                            }">
                        <a>${message.sentDate}</a>
                    </div>
                </div>
            `;
                    } else {
                    }
                });

                prevMsg = message;
                prevMsgType = msgType;
            });

            addHoverListeners();
        }
    };
}


function sendEvent(websocketService: WebSocketService, datas: any) {
    websocketService.sendMessage(datas);
}









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



