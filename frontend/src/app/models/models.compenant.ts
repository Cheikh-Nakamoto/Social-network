import {NgForm} from "@angular/forms";

export  class logindata {
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
  // Other methods...

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
