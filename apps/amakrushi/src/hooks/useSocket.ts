"use client";
import { useMemo } from "react";
import { io } from "socket.io-client";
import { useLocalStorage } from "./useLocalStorage";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

export const useSocket = () => {

  const [mobile] = useLocalStorage('mobile',null,false);

  return useMemo(
    () =>
      io(URL, {
        transportOptions: {
        	polling: {
        		extraHeaders: {
        			Authorization: `Bearer ${localStorage.getItem('auth')}`,
        			channel: 'akai'
        		}
        	}
        },
        query: {
          deviceId: `akai:${mobile}`,
        },
        autoConnect: false,
      }),
    [mobile]
  );
};