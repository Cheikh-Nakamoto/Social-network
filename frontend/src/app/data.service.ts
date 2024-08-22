// data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080/sn/api'; // l'URL de votre API

  constructor(private http: HttpClient) { }

  // Exemple de requête GET
  getData<T>(endpoint: string, returnType?: T): Observable<T | any> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError),
        map(data => returnType ? data : data as any)
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

  getGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups`);
  }

  getGroupJoined() : Observable<any> {
    let user = localStorage.getItem('user');
    let userId = JSON.parse(user as string).id.toString(); // Convert user id to string
    return this.http.get(`${this.apiUrl}/groups/joined?user_id=${userId}`);
  }

  getGroupById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${id}`);
  }

  createGroup(group: any): Observable<any> {
    console.log(group)
    return this.http.post(`${this.apiUrl}/groups/create`, group);
  }

  createEvent(group: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/events/create`, group);
  }

  addMember(groupId: number, userId: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/add_member`, JSON.stringify({ 'group_id':groupId, 'user_id':userId, 'role':role }));
  }

  ejectMember(groupId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/eject_member`, { groupId, userId });
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/delete?id=${groupId}`);
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
