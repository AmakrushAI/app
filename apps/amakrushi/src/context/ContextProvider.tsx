'use client'
import { FC, ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from ".";
import { map } from 'lodash'

import { toast } from "react-toastify";
import { User } from "../types";

import { send } from "../components/websocket";
import moment from "moment";
import { socket } from "../socket";



const ContextProvider:FC<{children:ReactElement}> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User>();
  
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [socketSession,setSocketSession]=useState<any>();
    const [isConnected, setIsConnected] = useState(socket.connected);
 
    const connect = (): void => {
     
      console.log("socket: socket.connect triggered");
     socket.connect();
    };
  
    useEffect(() => {
      if(typeof window !=='undefined' && !isConnected)
      connect();
    }, [isConnected]);
  
   
  
    const updateMsgState = useCallback(({ user, msg, media }:{user:{name:string;id:string},msg:{content:{title:string;choices:any},messageId:string},media:any}) => {
      const newMsg = {
        username: user?.name,
        text: msg.content.title,
        choices: msg.content.choices,
        position: "left",
        id: user?.id,
        botUuid: user?.id,
        messageId: msg?.messageId,
        ...media,
      };
      setMessages((prev: any) => [...prev, newMsg]);
    }, []);
  
    const onMessageReceived = useCallback(
      (msg: any): void => {
        console.log("socket receiving msg:", { msg });
       
        // @ts-ignore
        const user = JSON.parse(localStorage.getItem("currentUser"));
        //  console.log("qwe12 message: ", { msg, currentUser, uu: JSON.parse(localStorage.getItem('currentUser')) });
        if (msg.content.msg_type === "IMAGE") {
          updateMsgState({
            user,
            msg,
            media: { imageUrl: msg?.content?.media_url },
          });
        } else if (msg.content.msg_type === "AUDIO") {
          updateMsgState({
            user,
            msg,
            media: { audioUrl: msg?.content?.media_url },
          });
        } else if (msg.content.msg_type === "VIDEO") {
          updateMsgState({
            user,
            msg,
            media: { videoUrl: msg?.content?.media_url },
          });
        } else if (
          msg.content.msg_type === "DOCUMENT" ||
          msg.content.msg_type === "FILE"
        ) {
          updateMsgState({
            user,
            msg,
            media: { fileUrl: msg?.content?.media_url },
          });
        } else if (msg.content.msg_type === "TEXT") {
          updateMsgState({ user, msg, media: {} });
        }
  
        localStorage.setItem(
          "userMsgs",
          JSON.stringify([
            ...messages,
            {
              username: user?.name,
              text: msg.content.title,
              choices: msg.content.choices,
              position: "left",
            },
          ])
        );
      },
      [messages, updateMsgState]
    );
  
    const onSessionCreated = useCallback((sessionArg: { session: any }): void => {
      setSocketSession(sessionArg)
    }, []);
  
    const onException = useCallback((exception: any) => {
      toast.error(exception?.message);
    }, []);
  
    console.log("socket:",{socketSession})
    useEffect(() => {
      function onConnect(): void {
        console.log("socket:  onConnect callback");
        setIsConnected(true);
      }
  
      function onDisconnect(): void {
        console.log("socket: disconnecting");
        setIsConnected(false);
      }
  
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("botResponse", onMessageReceived);
  
      socket.on("exception", onException);
      socket.on("session", onSessionCreated);
  
      return () => {
        socket.disconnect();
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("botResponse", onMessageReceived);
        socket.off("session", ()=>setSocketSession('hell0'));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onException, onSessionCreated]);
  
  
    
    const onChangeCurrentUser = useCallback((newUser: User) => {
      setCurrentUser({ ...newUser, active: true });
      localStorage.removeItem("userMsgs");
      setMessages([]);
    }, []);
  
    
    const sendMessage = useCallback(
      (text: string, media: any, isVisibile = true): void => {
       alert('hello')
        console.log("socket:",{socketSession})

        //@ts-ignore
        send(text, socketSession, null, currentUser, socket, null);
        if (isVisibile)
          if (media) {
            if (media.mimeType.slice(0, 5) === "image") {
              
            } else if (media.mimeType.slice(0, 5) === "audio" && isVisibile) {
              
            } else if (media.mimeType.slice(0, 5) === "video") {
              
            } else if (media.mimeType.slice(0, 11) === "application") {
              
            } else {
             
            }
          } else {
            localStorage.setItem(
              "userMsgs",
              JSON.stringify([
                ...messages,
                {
                  username: "state.username",
                  text: text,
                  position: "right",
                  botUuid: currentUser?.id,
                  disabled: true,
                },
              ])
            );
  
            //@ts-ignore
            setMessages((prev:any) => [
              ...map(prev, (prevMsg) => ({ ...prevMsg, disabled: true })),
              {
                username: "state.username",
                text: text,
                position: "right",
                botUuid: currentUser?.id,
                payload: { text },
                time: moment().valueOf(),
                disabled: true,
              },
            ]);
          }
      },
      [currentUser, messages,socketSession]
    );
  
    const values = useMemo(
      () => ({
        currentUser,
        allUsers: users,
        toChangeCurrentUser: onChangeCurrentUser,
        sendMessage,
        messages,
        setMessages,
        loading,
        setLoading ,
        socketSession  }),
      [
        currentUser,
        socketSession,
        users,
        onChangeCurrentUser,
        sendMessage,
        messages,
        loading,
        setLoading,
      ]
    );
  

  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  );
};


const SSR:FC<{children:ReactElement}> =({children})=>{
  if(typeof window === 'undefined')
  return null
  return <ContextProvider>{children}</ContextProvider>
}
export default SSR;

