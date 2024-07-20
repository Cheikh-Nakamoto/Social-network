****# TODO - Social Network 01

## 1. Configuration du Projet

### Frontend (Angular)
- [ ] Initialiser le projet Angular
    - [ ] Installer Angular CLI
    - [ ] Créer un nouveau projet Angular
- [ ] Configurer Angular Material
    - [ ] Installer Angular Material
    - [ ] Sélectionner un thème

### Backend (Golang)
- [ ] Initialiser le projet Go
    - [ ] Créer un répertoire pour le backend
    - [ ] Initialiser le module Go
- [ ] Configurer les dépendances
    - [ ] Ajouter Gorilla WebSocket, Gorilla Mux, SQLite, bcrypt

## 2. Authentification

### Frontend
- [ ] Formulaire d'inscription
    - [ ] Créer un composant d'inscription
    - [ ] Ajouter des champs pour email, mot de passe, prénom, nom, date de naissance, avatar, pseudonyme, description
    - [ ] Valider les entrées utilisateur
- [ ] Formulaire de connexion
    - [ ] Créer un composant de connexion
    - [ ] Ajouter des champs pour email et mot de passe
    - [ ] Gérer les erreurs de connexion
- [ ] Gestion des sessions
    - [ ] Implémenter l'authentification par JWT
    - [ ] Stocker le token JWT dans les cookies ou local storage

### Backend
- [ ] Endpoints d'inscription et de connexion
    - [ ] Créer des routes pour l'inscription (/api/register) et la connexion (/api/login)
    - [ ] Implémenter la logique de création de compte et de vérification des identifiants
    - [ ] Utiliser bcrypt pour le hachage des mots de passe
- [ ] Gestion des sessions et JWT
    - [ ] Générer des tokens JWT pour les utilisateurs authentifiés
    - [ ] Gérer les cookies pour maintenir la session utilisateur

## 3. Interface Utilisateur

### Frontend
- [ ] Page de profil
    - [ ] Créer un composant de profil utilisateur
    - [ ] Afficher les informations de l'utilisateur
    - [ ] Afficher l'activité de l'utilisateur (posts)
    - [ ] Afficher les abonnés et les abonnements
- [ ] Publication de posts
    - [ ] Créer un composant pour créer des posts
    - [ ] Ajouter des champs pour le texte et les images
    - [ ] Gérer les options de confidentialité (public, privé, presque privé)
- [ ] Commentaires sur les posts
    - [ ] Créer un composant pour les commentaires
    - [ ] Permettre aux utilisateurs de commenter les publications
- [ ] Gestion des images
    - [ ] Implémenter le téléchargement et l'affichage des images (JPEG, PNG, GIF)

## 4. Fonctionnalités Sociales

### Frontend
- [ ] Abonnements
    - [ ] Ajouter des boutons pour suivre et se désabonner
    - [ ] Gérer les demandes de suivi et les notifications
- [ ] Groupes
    - [ ] Créer un composant pour la gestion des groupes
    - [ ] Permettre la création, l'invitation et la gestion des membres
    - [ ] Ajouter des publications dans les groupes
- [ ] Chat
    - [ ] Implémenter un système de messagerie privée avec WebSockets
    - [ ] Créer des salles de chat pour les groupes
- [ ] Notifications
    - [ ] Créer un composant de notifications
    - [ ] Afficher les notifications pour les demandes de suivi, les invitations aux groupes, etc.

### Backend
- [ ] Endpoints pour les fonctionnalités sociales
    - [ ] Créer des routes pour les abonnements, les groupes, les posts, et les commentaires
    - [ ] Implémenter la logique de gestion des abonnements, des groupes, et des notifications
- [ ] Gestion des images
    - [ ] Implémenter le téléchargement et le stockage des images
    - [ ] Gérer les chemins des images dans la base de données
- [ ] WebSockets pour le chat
    - [ ] Configurer Gorilla WebSocket pour la messagerie en temps réel

## 5. Backend

### Serveur
- [ ] Initialiser le serveur Go
    - [ ] Créer un serveur avec Gorilla Mux
    - [ ] Configurer les routes pour les différentes fonctionnalités
- [ ] Base de données SQLite
    - [ ] Configurer SQLite pour stocker les données
    - [ ] Créer les migrations pour structurer la base de données
- [ ] Middleware
    - [ ] Implémenter des middlewares pour l'authentification, la gestion des images, et les WebSockets
- [ ] Migrations
    - [ ] Créer des fichiers de migration pour créer les tables nécessaires

## 6. Conteneurisation avec Docker

### Backend
- [ ] Dockerfile pour le backend
    - [ ] Créer un Dockerfile pour le backend
    - [ ] Configurer l'image pour exécuter le serveur Go

### Frontend
- [ ] Dockerfile pour le frontend
    - [ ] Créer un Dockerfile pour le frontend
    - [ ] Configurer l'image pour servir l'application Angular

### Réseau de conteneurs
- [ ] docker-compose
    - [ ] Créer un fichier `docker-compose.yml` pour orchestrer les conteneurs
    - [ ] Configurer les services pour le backend et le frontend

## 7. Tests et Validation

### Frontend
- [ ] Tests unitaires
    - [ ] Écrire des tests unitaires pour les composants Angular
- [ ] Tests d'intégration
    - [ ] Vérifier l'intégration entre les composants Angular et les endpoints backend

### Backend
- [ ] Tests unitaires
    - [ ] Écrire des tests unitaires pour les fonctions Go
- [ ] Tests d'intégration
    - [ ] Vérifier l'intégration entre les routes Go et la base de données SQLite

## 8. Déploiement

- [ ] Déploiement sur un serveur
    - [ ] Déployer les conteneurs Docker sur un serveur
- [ ] Configuration de Caddy
    - [ ] Utiliser Caddy pour servir l'application et gérer les certificats SSL
