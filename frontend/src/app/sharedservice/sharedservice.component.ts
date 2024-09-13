import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedserviceComponent {
  // Utilisation de BehaviorSubject pour permettre aux composants de s'abonner aux changements
  private sharedData = new BehaviorSubject<any>(null);

  // Expose un observable pour que les composants puissent écouter les changements
  sharedData$ = this.sharedData.asObservable();

  constructor() {}

  // Méthode pour mettre à jour les données partagées
  setData(data: any): void {
    this.sharedData.next(data);
  }

  // Méthode pour obtenir les données partagées
  getData(): any {
    return this.sharedData.getValue();
  }
}
