import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ChatRoutingModule } from './chat-routing.module';

const config: SocketIoConfig={url: 'http://localhost:8080', options: {}}


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ChatRoutingModule,
    SocketIoModule.forRoot(config)
  ]
})
export class ChatModule{}

