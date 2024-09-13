// data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders , HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from './chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080/sn/api'; // l'URL de votre API
  
  
  searchUsers(query: string): Observable<any[]> {
  
    return this.http.get<any[]>(`${this.apiUrl}/allusers`).pipe(
      map(users => {
        const validUsers = users.filter(user => user !== null && user !== undefined);
        
        return validUsers.filter(user =>
          user.firstname.toLowerCase().includes(query.toLowerCase()) ||
          user.lastname.toLowerCase().includes(query.toLowerCase()) ||
          user.nickname.toLowerCase().includes(query.toLowerCase())
        );
      })
    );
  }
  
  getAll() {
    throw new Error('Method not implemented.');
  }


  

  constructor(private http: HttpClient) { }

  // Exemple de requête GET
  getData<T>(endpoint: string, returnType?: T): Observable<T | any> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError),
        map(data => returnType ? data : data as any)
      );
  }
  
  accept_decline(routes : string,data :any){
    return this.http.post(`${this.apiUrl}/${routes}`, data).pipe(
      catchError(this.handleError)
    );
  }
  ItsMember(routes : string,data :any){
    return this.http.post(`${this.apiUrl}/${routes}`, data).pipe(
      catchError(this.handleError)
    );
  }
  // Méthode POST
  postData(endpoint: string, data: any): Observable<any> {
    let httpOptions = {};
  
    if (data instanceof FormData) {
      // Ne définissez pas le Content-Type, le navigateur le fera pour vous (avec les limites correctes)
      httpOptions = {
        headers: new HttpHeaders({}),
      };
    } else {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      };
    }
  
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, httpOptions).pipe(
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
  getNotification(userID : string) : Observable<any>{
    let params = new HttpParams()
    .set('user_id', userID);
  return this.http.get(`${this.apiUrl}/notification/`, { params });
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
    let userId = JSON.parse(localStorage.getItem('userID') as string);
    return this.http.get(`${this.apiUrl}/joined/groups/?user_id=${userId}`);
  }
  getGroupJoinedByID(userId:string,group_id : string) : Observable<any> {
    let params = new HttpParams()
    .set('user_id', userId).set('group_id', group_id)
    return this.http.get(`${this.apiUrl}/joined/groups/?user_id=${userId}`);
  }
  
  getGroupById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${id}`);
  }

  createGroup(group: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/create`, group);
  }

  createEvent(group: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/create`, group);
  }

  addMember(groupId: number, userId: string,target_id:string, role: string): Observable<any> {
    let firstname = localStorage.getItem('firstname') as string
    let lastname =  localStorage.getItem('lastname') as string
    let name = firstname + " "+ lastname
    return this.http.post(`${this.apiUrl}/groups/add_member`, JSON.stringify({ 'group_id':groupId, 'user_id':Number(userId), 'role':role ,'target_id':parseInt(target_id),'username':name}));
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
  postCommentWithImage(postId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments`, formData);
  }

  ChangeNatureAccountStatus(userid:number,nature : boolean): Observable<any> {
    let body = {
      user_id: userid,
      nature : nature
    }
    return this.http.post(`${this.apiUrl}/nature-profil/`,body)
  } 
  
  
}



@Injectable({
    providedIn: 'root',
})
export class GetUserService {
    private userSubject: BehaviorSubject<any>;
    public user: Observable<any>;

    private chatCountSubject: BehaviorSubject<number> =
        new BehaviorSubject<number>(0);

    // Exposez chatCount en tant qu'Observable
    public chatCount$: Observable<number> =
        this.chatCountSubject.asObservable();

    constructor() {
        // Récupère l'utilisateur depuis localStorage lors de la création du service
        const userId = JSON.parse(localStorage.getItem('userID') as string);
        this.userSubject = new BehaviorSubject<any>(userId);
        this.user = this.userSubject.asObservable();
    }

    public getChatAmount(): number {
      return this.chatCountSubject.getValue();
    }

    public updateChatCount(newCount: number): void {
        this.chatCountSubject.next(newCount+this.getChatAmount());
    }

    // Méthode pour obtenir l'utilisateur actuel sous forme d'Observable
    public get currentUser(): any {
        return this.userSubject.value;
    }

    // Méthode pour mettre à jour l'utilisateur dans le service et localStorage
    public updateUser(user: any): void {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
    }
}



@Injectable({
    providedIn: 'root',
})
export class VisibilityService {
    private visibilitySubject = new BehaviorSubject<boolean>(false); // État initial : masqué
    visibility$ = this.visibilitySubject.asObservable();

    toggleVisibility(): void {
        this.visibilitySubject.next(!this.visibilitySubject.value); // Inverse l'état
    }
}

