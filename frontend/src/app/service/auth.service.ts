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

    logout(token: any): Observable<any> {
        return this.http.post(`${this.api}/logout`, token)
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
        localStorage.removeItem('status')
        localStorage.removeItem('user')
    }

    updateUser(id: any, user: any) {
        return this.http.put(`${this.api}/update-profile/${id}`, user)
    }
}
