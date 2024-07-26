import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDTO} from './models/models.compenant';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  private apiUrl = 'http://localhost:8080/sn/api'; // l'URL de votre API

  constructor(private http: HttpClient) { }

  // Exemple de requête GET
  getData(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  // Méthode POST
  postData(endpoint: string, data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  // Méthode pour enregistrer un utilisateur
  registerUser(user: UserDTO): Observable<UserDTO> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<UserDTO>(`${this.apiUrl}/register`, user, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
