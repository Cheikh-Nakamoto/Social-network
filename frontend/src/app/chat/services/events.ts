// event-handler.ts
import { UserDTO } from "../../models/models.compenant";
export interface EventPayload {
  [key: string]: any;
}

export interface Event {
  type: string;
  payload: EventPayload;
}

export function routeEvent(event: Event): void {
  if (event.type === undefined) {
    return;
  }

  switch (event.type) {
    case 'send_message':
      handleSendMessage(event.payload);
      break;
    case 'new_message':
      handleNewMessage(event.payload);
      break;
    case 'get_messages':
      handleGetMessages(event.payload);
      break;
    case 'get_chatbar_data':
      // handleGetChatbarData(event.payload);
      break;
    case 'update_chatbar_data':
      break;
    case 'typing_start':
      handleTypingStart(event.payload);
      break;
    case 'typing_stop':
      handleTypingStop(event.payload);
      break;
    case 'new_notification':
      handleTypingStop(event.payload);
      break;
    default:
      // alert("unsupported message type");
      break;
  }
}

export function handleSendMessage(payload: EventPayload): void {
}

export function handleNewMessage(payload: EventPayload): void {
}

export function handleGetMessages(payload: EventPayload): void {
}

// export function handleGetChatbarData(payload: EventPayload): void {
//   // Implement your logic here
//   if (payload instanceof Array) {
//     payload.sort((a, b) => {
//       const dateA = new Date(a.lastMsgData.sentDate);
//       const dateB = new Date(b.lastMsgData.sentDate);

//       if (a.lastMsgData.sentDate === '') return 1;
//       if (b.lastMsgData.sentDate === '') return -1;
//       return dateB.getTime() - dateA.getTime();
//     });

//     // allusers.forEach((user: UserDTO) => {
//     //   const matchingUser = payload.find((user2) => user2.id === user.id);
//     //   if (matchingUser) {
//     //     user.isOnline = true;
//     //   }
//     // });

//   } else {
//   }
// }

export function handleTypingStart(payload: EventPayload): void {
  // Implement your logic here
}

export function handleTypingStop(payload: EventPayload): void {
  // Implement your logic here
}
