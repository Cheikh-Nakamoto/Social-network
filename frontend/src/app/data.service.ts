import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://api.example.com'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Exemple de requête GET
  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data`)
      .pipe(
        catchError(this.handleError<any>('getData'))
      );
  }

  // Exemple de requête POST
  postData(data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<any>(`${this.apiUrl}/data`, data, httpOptions)
      .pipe(
        catchError(this.handleError<any>('postData'))
      );
  }

  // Gestion des erreurs
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
