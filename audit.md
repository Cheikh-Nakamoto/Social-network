# Fonctionnalité

## Respect des exigences

- Les exigences pour les packages autorisés ont-elles été respectées ?
- En examinant le système de fichiers du backend, avez-vous trouvé une structure bien organisée, similaire à l'exemple fourni dans le sujet, avec une séparation claire des dossiers `packages` et `migrations` ?
- Le système de fichiers du frontend est-il bien organisé ?

## Backend

- Le backend inclut-il une séparation claire des responsabilités parmi ses trois parties principales : Serveur, Application (App), et Base de données ?
- Y a-t-il un serveur qui reçoit efficacement les requêtes entrantes et sert de point d'entrée pour toutes les requêtes de l'application ?
- L'application (App) exécutée sur le serveur écoute-t-elle correctement les requêtes, récupère-t-elle les informations de la base de données et envoie-t-elle des réponses ?
- La logique principale du réseau social est-elle implémentée dans le composant App, incluant la logique pour gérer différents types de requêtes basées sur HTTP ou d'autres protocoles ?

## Base de données

- SQLite est-elle utilisée dans le projet comme base de données ?
- Les clients peuvent-ils demander des informations stockées dans la base de données et soumettre des données à y ajouter sans rencontrer d'erreurs ou de problèmes ?
- L'application implémente-t-elle un système de migration ?
- Ce système de fichiers de migration est-il bien organisé ? (comme l'exemple du sujet)
- Démarrez l'application du réseau social, puis entrez dans la base de données en utilisant la commande `sqlite3 <nom_base_de_donnees.db>`.
- Les migrations sont-elles appliquées par le système de migration ?

## Authentification

- L'application implémente-t-elle des sessions pour l'authentification des utilisateurs ?
- Les bons éléments de formulaire sont-ils utilisés pour l'inscription ? (Email, Mot de passe, Prénom, Nom, Date de naissance, Avatar/Image (Optionnel), Pseudo (Optionnel), À propos de moi (Optionnel))
- Essayez d'inscrire un utilisateur.
  - Pendant l'inscription, lors de la tentative d'enregistrement d'un utilisateur, l'application a-t-elle correctement enregistré l'utilisateur dans la base de données sans erreurs ?
- Essayez de vous connecter avec l'utilisateur que vous venez d'enregistrer.
  - Lors de la tentative de connexion avec l'utilisateur que vous venez d'enregistrer, le processus de connexion a-t-il fonctionné sans problèmes ?
- Essayez de vous connecter avec l'utilisateur que vous avez créé, mais avec un mot de passe ou un email incorrect.
  - L'application a-t-elle correctement détecté et répondu aux détails de connexion incorrects ?
- Essayez d'inscrire le même utilisateur que vous avez déjà enregistré.
  - L'application a-t-elle détecté si l'email/l'utilisateur est déjà présent dans la base de données ?
- Ouvrez deux navigateurs (par ex. Chrome et Firefox), connectez-vous dans un et actualisez l'autre navigateur.
  - Pouvez-vous confirmer que le navigateur non connecté reste non enregistré ?
- En utilisant les deux navigateurs, connectez-vous avec des utilisateurs différents sur chacun. Puis actualisez les deux navigateurs.
  - Pouvez-vous confirmer que les deux navigateurs continuent avec les bons utilisateurs ?

## Abonnés

- Essayez de suivre un utilisateur privé.
  - Pouvez-vous envoyer une demande de suivi à l'utilisateur privé ?
- Essayez de suivre un utilisateur public.
  - Pouvez-vous suivre l'utilisateur public sans avoir besoin d'envoyer une demande de suivi ?
- Ouvrez deux navigateurs (ex : Chrome et Firefox), connectez-vous en tant que deux utilisateurs privés différents et essayez, avec l'un d'eux, de suivre l'autre.
  - L'utilisateur qui a reçu la demande peut-il accepter ou refuser la demande de suivi ?
- Après avoir suivi un autre utilisateur avec succès, essayez de ne plus le suivre.
  - Avez-vous pu le faire ?

## Profil

- Essayez d'ouvrir votre propre profil.
  - Le profil affiche-t-il toutes les informations demandées dans le formulaire d'inscription, à l'exception du mot de passe ?
  - Le profil affiche-t-il chaque publication créée par l'utilisateur ?
  - Le profil affiche-t-il les utilisateurs que vous suivez et ceux qui vous suivent ?
  - Pouvez-vous passer d'un profil privé à un profil public et inversement ?
- Ouvrez deux navigateurs et connectez-vous avec des utilisateurs différents, avec l'un des utilisateurs ayant un profil privé et suivez cet utilisateur avec succès.
  - Pouvez-vous voir le profil privé d'un utilisateur suivi ?
- Utilisez les deux navigateurs avec les mêmes utilisateurs, avec l'un des utilisateurs ayant un profil privé et assurez-vous de ne pas le suivre.
  - Êtes-vous empêché de voir le profil privé d'un utilisateur non suivi ?
- Utilisez les deux navigateurs avec les utilisateurs, avec l'un des utilisateurs ayant un profil public et assurez-vous de ne pas le suivre.
  - Pouvez-vous voir le profil public d'un utilisateur non suivi ?
- Utilisez les deux navigateurs avec les utilisateurs, avec l'un des utilisateurs ayant un profil public et suivez cet utilisateur avec succès.
  - Pouvez-vous voir le profil public d'un utilisateur suivi ?

## Publications

- Pouvez-vous créer une publication et commenter des publications existantes après vous être connecté ?
- Essayez de créer une publication.
  - Pouvez-vous y inclure une image (JPG ou PNG) ou un GIF ?
- Essayez de créer un commentaire.
  - Pouvez-vous y inclure une image (JPG ou PNG) ou un GIF ?
- Essayez de créer une publication.
  - Pouvez-vous spécifier le type de confidentialité de la publication (privée, publique, presque privée) ?
  - Si vous choisissez l'option de confidentialité "presque privée", pouvez-vous spécifier les utilisateurs autorisés à voir la publication ?

## Groupes

- Essayez de créer un groupe.
  - Avez-vous pu inviter l'un de vos abonnés à rejoindre le groupe ?
- Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur, suivez-vous mutuellement et, avec l'un des utilisateurs, créez un groupe et invitez l'autre utilisateur.
  - L'autre utilisateur a-t-il reçu une invitation de groupe qu'il/elle peut refuser/accepter ?
- En utilisant les mêmes navigateurs et les mêmes utilisateurs, avec l'un des utilisateurs créez un groupe et, avec l'autre, essayez de faire une demande d'entrée dans le groupe.
  - Le propriétaire du groupe a-t-il reçu une demande qu'il/elle peut refuser/accepter ?
- Un utilisateur peut-il faire des invitations de groupe après avoir fait partie du groupe (étant l'utilisateur différent du créateur du groupe) ?
- Un utilisateur peut-il faire une demande d'entrée dans un groupe ?
- Après avoir fait partie d'un groupe, l'utilisateur peut-il créer des publications et commenter des publications déjà créées ?
- Essayez de créer un événement dans un groupe.
  - Vous a-t-on demandé un titre, une description, un jour/heure et au moins deux options (participer, ne pas participer) ?
- En utilisant les mêmes navigateurs et les mêmes utilisateurs, après que les deux sont devenus membres du même groupe, créez un événement avec l'un d'eux.
  - L'autre utilisateur peut-il voir l'événement et voter pour l'option de son choix ?

## Chat

- Essayez d'ouvrir deux navigateurs (ex : Chrome et Firefox), connectez-vous avec des utilisateurs différents sur chacun d'eux. Puis, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'autre utilisateur.
  - L'autre utilisateur a-t-il reçu le message en temps réel ?
- Essayez d'ouvrir deux navigateurs (ex : Chrome et Firefox), connectez-vous avec des utilisateurs différents qui ne se suivent pas du tout. Puis, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'autre utilisateur.
  - Pouvez-vous confirmer qu'il n'a pas été possible de créer un chat entre ces deux utilisateurs ?
- En utilisant les deux navigateurs avec les utilisateurs, commencez un chat entre les deux.
  - Le chat entre les utilisateurs s'est-il bien déroulé ? (le serveur n'a pas planté)
- Essayez d'ouvrir trois navigateurs (ex : Chrome et Firefox ou un navigateur privé), connectez-vous avec des utilisateurs différents sur chacun d'eux. Puis, avec l'un des utilisateurs, essayez d'envoyer un message privé à l'un des autres utilisateurs.
  - Seul l'utilisateur ciblé a-t-il reçu le message ?
- En utilisant les trois navigateurs avec les utilisateurs, entrez dans un groupe commun pour chaque utilisateur. Ensuite, commencez à envoyer des messages dans la salle de chat commune avec l'un des utilisateurs.
  - Tous les utilisateurs qui font partie du groupe ont-ils reçu le message en temps réel ?
- En utilisant les trois navigateurs avec les utilisateurs, continuez à discuter entre les utilisateurs dans le groupe.
  - Le chat entre les utilisateurs s'est-il bien déroulé ? (le serveur n'a pas planté)
  - Pouvez-vous confirmer qu'il est possible d'envoyer des emojis via le chat aux autres utilisateurs ?

## Notifications

- Pouvez-vous vérifier les notifications sur chaque page du projet ?
- Ouvrez deux navigateurs, connectez-vous en tant que deux utilisateurs privés différents et, avec l'un d'eux, essayez de suivre l'autre.
  - L'autre utilisateur a-t-il reçu une notification concernant la demande de suivi ?
- Ouvrez deux navigateurs, connectez-vous avec des utilisateurs différents sur chaque navigateur,

 suivez-vous mutuellement et, avec l'un des utilisateurs, créez un groupe et invitez l'autre utilisateur.
  - L'autre utilisateur a-t-il reçu une notification concernant l'invitation de groupe ?
- En utilisant les deux navigateurs et les mêmes utilisateurs, essayez de faire une demande d'entrée dans le groupe.
  - Le propriétaire du groupe a-t-il reçu une notification concernant la demande d'entrée dans le groupe ?

## Sécurité

- Le projet ne contient pas de fichiers `.env` ou `config.js` avec des informations confidentielles.
- Le projet utilise HTTPS pour sécuriser les échanges entre le client et le serveur.
- La politique CORS est correctement configurée.
- Toutes les communications entre le client et le serveur sont correctement sécurisées.
- L'application a un mécanisme de gestion des erreurs robuste qui empêche l'exposition d'informations sensibles aux utilisateurs.
- Le projet est à l'abri des attaques courantes comme l'injection SQL, le XSS, le CSRF, etc.
