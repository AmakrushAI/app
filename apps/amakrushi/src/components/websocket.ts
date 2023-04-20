import { Socket } from 'socket.io-client';


type SendType={
  text:string;
  socketSession:{userID:string;socketID:string},
  socket:Socket
}

export const send = ({text, socketSession:session,  socket}:SendType) => {
    socket.emit("botRequest", {
      content: {
        text,
        userId: session.userID,
        appId: "AKAI_App_Id",
        channel: "AKAI",
        from: session.socketID,
        context: null,
        accessToken: null,
      },
      to: `akai:${localStorage.getItem('mobile')}`, 
    });
  
}
