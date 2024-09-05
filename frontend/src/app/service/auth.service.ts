import { Injectable } from '@angular/core'; import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    api: string = environment.api
    user: any

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.api}/login`, credentials)
    }

    register(user: any): Observable<any> {
        return this.http.post(`${this.api}/register`, user)
    }
    logout(): Observable<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login.');
            this.removeSession();
            this.router.navigateByUrl('/login')
        }

        return new Observable<void>(subscriber => {
            this.http.post<void>(`${this.api}/logout`, { token }).subscribe({
                next: () => {
                    this.removeSession();
                    this.router.navigateByUrl('/login')
                    subscriber.next(); // Notify observers that operation completed successfully
                    subscriber.complete(); // Complete the observable
                },
                error: (err) => {
                    console.error('Error during logout:', err);
                    this.removeSession();
                    this.router.navigateByUrl('/login')
                    subscriber.error(err); // Notify observers that an error occurred
                }
            });
        });
    }

    checkOnlineStatus(token: any): Observable<any> {
        return this.http.post(`${this.api}/is_online`, token)
    }

    isLoggedIn(): Observable<boolean> {
        const data = {
            token: localStorage.getItem('token')
        }

        if (!localStorage.getItem('token')) {
            console.log('No token or user id')
            return of(false)
        } else {
            return this.checkOnlineStatus(data).pipe(
                map(response => response.is_online && response.status == 'online')
            )
        }
    }

    isOnline() {
        this.isLoggedIn().subscribe(response => {
            if (response) {
                console.log('You are online')
                return
            } else {
                console.log('You are offline')
                this.removeSession()
                this.router.navigate(['/login']).then()
            }
        })
    }

    getToken(): string | null {
        return localStorage.getItem('token')
    }

    getUserID(): number | null {
        this.user = JSON.parse(localStorage.getItem('user') as string)
        return localStorage.getItem('user') ? this.user.id : null
    }

    getAll() {
        return this.http.get(`${this.api}/users`)
    }

    getUser(id: any) {
        return this.http.get(`${this.api}/profile/${id}`)
    }

    removeSession() {
        localStorage.removeItem('token')
        localStorage.removeItem('userID')
    }

    updateUser(id: any, user: any) {
        return this.http.put(`${this.api}/update-profile/${id}`, user)
    }
    searchUsers(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/allusers`).pipe(
            map(users => users.filter(user =>
                user.firstname.toLowerCase().includes(query.toLowerCase()) ||
                user.lastname.toLowerCase().includes(query.toLowerCase()) ||
                user.nickname.toLowerCase().includes(query.toLowerCase())
            ))
        );
    }
    
    
}
