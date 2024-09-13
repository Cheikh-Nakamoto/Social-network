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
    console.log('no type field in the event');
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
      console.log('updating chatbar data');
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
  console.log('handleSendMessage', payload);
  // Implement your logic here
}

export function handleNewMessage(payload: EventPayload): void {
  console.log('handleNewMessage', payload);
  // Implement your logic here
}

export function handleGetMessages(payload: EventPayload): void {
  console.log('handleGetMessages', payload);
  // Implement your logic here
}

// export function handleGetChatbarData(payload: EventPayload): void {
//   console.log('handleGetChatbarData', payload);
//   // Implement your logic here
//   if (payload instanceof Array) {
//     console.log('successfully retrieved chatbar data');
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

//     // console.log(obj.allusers)
//   } else {
//     console.log('retrieving chatbar data');
//   }
// }

export function handleTypingStart(payload: EventPayload): void {
  console.log('handleTypingStart', payload);
  // Implement your logic here
}

export function handleTypingStop(payload: EventPayload): void {
  console.log('handleTypingStop', payload);
  // Implement your logic here
}
