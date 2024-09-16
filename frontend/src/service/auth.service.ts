import { Injectable } from '@angular/core';

import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { environment } from '../environments/environment';
import { Post } from '../entity/post'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    api: string = environment.api

    constructor(private http: HttpClient) { }

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
            token: this.getToken()
        }

        if (!this.getToken() || !this.getUserID()) {
            return of(false)
        } else {
            return this.checkOnlineStatus(data).pipe(
                map(response => response.is_online && response.status == 200)
            )
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token')
    }
    getUserPosts(userId: number): Observable<any> {
        return this.http.get(`${this.api}/post-profile/${userId}`).pipe(
            map(response => response)
        )
    }
    getUserID(): number | null {
        return localStorage.getItem('userID') ? parseInt(localStorage.getItem('userID')!) : null
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

    createSession(token: string, userID: any) {
        localStorage.setItem('token', token)
        localStorage.setItem('userID', userID)
    }

    // updateUser(id: any, user: any) {
    //     return this.http.put(`${this.api}/profile-update/${id}`, user)
    // }
    updateUserProfile(userId: number, userData: any): Observable<any> {
        
        
        return this.http.put<any>(`${this.api}/profile-update/${userId}`, userData);
      }
    // updateUserProfile(id: number, updatedUser: any) {
    //     return this.http.put(`http://localhost:8080/sn/api/profile-update/${id}`, updatedUser);
    // }

}
