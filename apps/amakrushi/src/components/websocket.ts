import { socket } from '../socket';

export const send = (msg: any, session: any, accessToken: any,toUser: {name: string, number: string | null},sockets:any,media:any) => {
console.log("abcd:",{msg,session,socket})
  
    socket.emit("botRequest", {
      content: {
        text: msg,
        userId: session.userID,
        appId: "AKAI_App_Id",
        channel: "AKAI",
        from: session.socketID,
        context: null,
        accessToken: accessToken,
      },
      to: `akai:7398050181`, 
    });
  
}
