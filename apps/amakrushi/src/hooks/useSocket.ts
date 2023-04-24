"use client";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocalStorage } from "./useLocalStorage";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";


export const useSocket = ():[Socket| undefined,boolean] => {

  const [mobile] = useLocalStorage('mobile',null,false);
  const [auth] = useLocalStorage('auth',null,false);
  const [socket,setSocket]=useState<Socket>();
  const [isSocketReady,setIsSocketReady]=useState(false);

  useEffect(()=>{
    if(mobile && !isSocketReady){
  
     setSocket(io(URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${auth}`,
            channel: 'akai'
          }
        }
      },
      query: {
        deviceId: `akai:${mobile}`,
      },
      autoConnect: false,
      transports: ['polling', 'websocket'],
      upgrade:false,
      

    }))
    setTimeout(()=> {setIsSocketReady(true)},100)
     ;
    }

    // return ()=>{
    //   setIsSocketReady(false);
    //   setSocket(null);
    // }
    
  },[auth, isSocketReady, mobile])
  
  return useMemo(()=>[socket,isSocketReady],[socket,isSocketReady])
};