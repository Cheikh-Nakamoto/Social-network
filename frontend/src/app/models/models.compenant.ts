
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
  image?: string;
  target_type: string;
  created_at: string;
}

// Représente la réponse structurée contenant les commentaires par post
export interface CommentContent {
  comments_by_post: { [key: number]: CommentDTO[] };
}

// SendCommentDTO interface
export interface SendCommentDTO {
  comments: { [key: number]: CommentDTO[] }; // Represents map[int][]CommentDTO
  commentsLength: { [key: number]: number }; // Represents map[int]int
}

export interface length {
  [key: number]: number
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
  privacy: string;
  user_id: string;
  group_id: number
}

// notification group et message

// TypeScript type for Notification
export interface Notification {
  id: number;          // Unique identifier for the notification
  user_id: number;      // ID of the user who created the notification
  target_id: number;    // ID of the target user or entity (can be NULL in some cases)
  group_id: number;    // ID of the group (optional, can be NULL)
  message: string;     // The message content of the notification
  is_read: boolean;     // Flag indicating whether the notification has been read
  role : string; //
  created_at: string;   // Timestamp of when the notification was created (ISO 8601 string)
}


// join group verification

export interface JoinGroupVerification {
  [groupId: number]: boolean;
}

export interface NotificationVerification {
  notif: Notification[];
}
 export interface StatusMap {
  [key: string]: boolean;
}


export interface MessageBody {
  senderId: number;
  receiverId: number;
  message: string;
}

export interface MessageGrBody {
  type: string; 
  senderId: number;
  receiverId: number;
  message: string;
}

export interface MessageData {
  type: string;
  datas: MessageBody;
}

export interface Eventtype{
  id: number;
  name: string;
  description: string;
  group_id: number;
  hour_start: Date;
  hour_end: Date;
  user_id: number;
}

