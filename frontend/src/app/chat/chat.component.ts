// my-component.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/chat.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Event } from './services/events';
import { ActivatedRoute } from '@angular/router';
import * as model from '../models/models.compenant'
import { DataService } from '../data.service';
import { HttpClientModule } from '@angular/common/http';





@Component({
  selector: 'chat-app',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, HttpClientModule], // Ajouter CommonModule ici
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
  providers: [DataService],
})
export class ChatComponent implements OnInit, OnDestroy {
  private messagesSubscription!: Subscription;
  public messages: any[] = [];
 user!: model.UserDTO;
  private id!: number;

  constructor(
    private websocketService: WebSocketService,
    private route: ActivatedRoute,
    private apiservice: DataService
  ) {
    route.queryParams.subscribe((params) => {
      this.id = params['userid'];
    });
  }

  ngOnInit(): void {
    this.getUserById(this.id);
    this.messagesSubscription = this.websocketService.messages$.subscribe(
      (message) => {
        this.messages.push(message);
        console.log(message);
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

  getUserById(id: number): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Vérifiez si l'ID utilisateur existe dans localStorage
    if (!userData.id) {
      console.error('No user ID found in localStorage.');
      return;
    }

    this.apiservice.getData('allusers').subscribe(
      (response: model.UserDTO[]) => {
        // Utilisez `find` pour rechercher directement l'utilisateur avec l'ID correspondant
        const foundUser = response.find(
          (user) => user != null && user.id === Number(id)
                    
        );



        console.log(foundUser);

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
}
