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
