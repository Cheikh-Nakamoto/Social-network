// data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  // Méthode pour uploader une image
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  likeTarget(id: number, userId: number, targetId: number, targetType: string, like: boolean): Observable<void> {
    const body = {
      id: id,
      user_id: userId.toString(),
      target_id: targetId,
      target_type: targetType,
      like: like
    };
    console.log(JSON.stringify(body))
    return this.http.post<void>(`${this.apiUrl}/likeTarget`, JSON.stringify(body));
  }

  dislikeTarget(id: number, userId: number, targetId: number, targetType: string, like: boolean): Observable<void> {
    const body = {
      id: id,
      user_id: userId.toString(),
      target_id: targetId,
      target_type: targetType,
      like: like
    };
    return this.http.post<void>(`${this.apiUrl}/dislikeTarget`, JSON.stringify(body));
  }



  getTargetLikes( targetType: string): Observable<any> {
    let params = new HttpParams()
      .set('target_type', targetType);
    return this.http.get(`${this.apiUrl}/targetLikes`, { params });
  }

  getTargetDislikes(targetType: string): Observable<any> {
    let params = new HttpParams()
      .set('target_type', targetType);
    return this.http.get(`${this.apiUrl}/targetDislikes`, { params });
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
