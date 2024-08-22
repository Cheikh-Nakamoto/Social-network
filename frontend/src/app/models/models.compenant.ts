
export interface responselogin {
  status: string,
  token: string,
  user: UserDTO
}

export interface AllUsersDTO {
  [key: string]: UserDTO
}

export interface User {
  id: number;
  nickname: string;
  firstname: string;
  lastname: string;
}

export interface UserDTO {
  id: number;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  date_of_birth: string;
  avatar: string;
  nickname: string;
  about_me: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  isOnline: boolean; // Ajout de la propriété isOnline
}

export interface Message {
  userFrom: UserDTO,
  content: string,
  userDest: UserDTO
}


export interface login {
  username: string,
  password: string
}


// Représente un commentaire individuel
export interface CommentDTO {
  id: number;
  user_id: string;
  target_id: number;
  content: string;
  target_type: string;
  created_at: string;
}

// Représente la réponse structurée contenant les commentaires par post
export interface CommentContent {
  comments_by_post: { [key: number]: CommentDTO[] };
}



export interface Posts {
  id: number;
  post: Post;
  comments: Comment[];
  likes: number;
  dislikes: number;
  shares: number;
}

//group
export interface Group {
  id: number;
  name: string;
  description?: string;
  owner: string;
  image?: string
  createdAt: string;
}

// post.model.ts

export interface Post {
  id: number;
  title: string;
  content: string;
  image: string;
  categories: string[];
  privacy: string;
  user_id: string;
}

// notification group et message

export interface Notification {
  id: number;          // Identifiant unique de la notification
  content: string;     // Contenu du message de la notification
  userId: number;      // Référence à l'utilisateur qui reçoit la notification
  groupId?: number;    // Référence optionnelle au groupe associé à la notification
  isRead: boolean;     // Indique si la notification a été lue
  createdAt: Date;     // Date et heure de création de la notification
}

// join group verification

export interface JoinGroupVerification {
  [groupId: number]: boolean;
}

