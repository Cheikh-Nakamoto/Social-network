import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/Acceuil']); // Rediriger vers l'accueil si le token existe
      return false;
    }
    return true; // Permettre l'accès à la page de login si le token n'existe pas
  }
}
