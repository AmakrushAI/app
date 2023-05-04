

type SendType={
	text:string;
	socketSession:{userID:string;socketID:string},
	socket: any;
	conversationId:string | '' | null
  }
  
  export const send = ({text, socketSession:session,  socket,conversationId}:SendType) => {
	
	sessionStorage.setItem('conversationId', conversationId || '')
	console.log("debug:",{text});
	  socket.emit("botRequest", {
		content: {
		  text,
		 // userId: session.userID,
		 userId: localStorage.getItem('userID'),
		 
		  appId: "AKAI_App_Id",
		  channel: "AKAI",
		 from: localStorage.getItem('userID'),
		  //from:  session.userID,
		  context: null,
		  accessToken: null,
		  conversationId
		},
		to: localStorage.getItem('userID'), 
		
		conversationId
	  });
	
  }