"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AppContext } from "../context/index";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

export const useSocket = (update: boolean): [Socket | undefined, boolean] => {
 

  const [socket, setSocket] = useState<Socket>();
  const [isSocketReady, setIsSocketReady] = useState(false);
  console.log("debug ddd :", {
    phn: localStorage.getItem("phoneNumber"),
    isSocketReady,
    avail: update,
  });
  useEffect(() => {
    console.log("#-debug dd hello",{update});
    if (localStorage.getItem("phoneNumber") && !isSocketReady && update) {
      
      setSocket(
        io(URL, {
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem("auth")}`,
                channel: "akai",
              },
            },
          },
          query: {
            deviceId: `akai:${localStorage.getItem("phoneNumber")}`,
          },
          autoConnect: false,
         // transports: ['polling', 'websocket'],
          upgrade:false,
        })
      );
      setTimeout(()=> setIsSocketReady(true),30)
    }
  }, [isSocketReady, update]);

  // useEffect(()=>{
  //   if(socket){
  //     setIsSocketReady(socket?.connected)
  //   }
  // },[socket])
  return useMemo(() => [socket, isSocketReady], [socket, isSocketReady]);
};
