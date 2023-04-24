"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AppContext } from "../context/index";
import { useLocalStorage } from "./useLocalStorage";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";


export const useSocket = (update:boolean):[Socket| undefined,boolean] => {
const context=useContext(AppContext);
console.log("debug dd :",{context})
  const [socket,setSocket]=useState<Socket>();
  const [isSocketReady,setIsSocketReady]=useState(false);

  useEffect(()=>{
   // console.log("debug dd :",{phn:localStorage.getItem('phoneNumber'),isSocketReady,avail:context?.isMobileAvailable})
    if(localStorage.getItem('phoneNumber') && !isSocketReady && update ){
     console.log("debug dd hello")
     setSocket(io(URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem('auth')}`,
            channel: 'akai'
          }
        }
      },
      query: {
        deviceId: `akai:${localStorage.getItem('phoneNumber')}`,
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
    
  },[  isSocketReady,update])
  
  return useMemo(()=>[socket,isSocketReady],[socket,isSocketReady])
};