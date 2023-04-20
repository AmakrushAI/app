"use client";
import { useMemo } from "react";
import { io } from "socket.io-client";

const URL = "wss://ts.gpt3.samagra.io";

export const useSocket = () => {
  const mobile = localStorage.getItem("mobile");

  return useMemo(
    () =>
      io(URL, {
        // transportOptions: {
        // 	polling: {
        // 		extraHeaders: {
        // 			Authorization: `` ,
        // 			channel: 'akai'
        // 		}
        // 	}
        // },
        query: {
          deviceId: `phone:${mobile}`,
        },
        autoConnect: false,
      }),
    [mobile]
  );
};
