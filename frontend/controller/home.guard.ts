import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']); // Rediriger vers la page de login si le token n'existe pas
      return false;
    }
    return true; // Permettre l'accès à la page d'accueil si le token existe
  }
}
