
import { NgForm } from "@angular/forms";

export interface responselogin {
  status: string,
  token: string,
  user: UserDTO
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


// post.model.ts
export interface Comment {
  id: number;
  owner: string;
  content: string;
}

export interface Posts {
  id: number;
  post: Post;
  comments: Comment[];
  likes: number;
  dislikes: number;
  shares: number;
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

