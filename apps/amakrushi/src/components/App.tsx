import { useState, useEffect, useRef, useContext } from "react";
import { io, Socket } from "socket.io-client";
import Notification from "./OTPpage/Notifications";
import { useCookies, withCookies } from "react-cookie";
import router from "next/router";

import { AppContext } from "../context";

import dynamic from "next/dynamic";
import axios from "axios";
import { NextPage } from "next";

const ChatUiWindow = dynamic(
  () => import("./PhoneView/ChatWindow/ChatUiWindow"),
  {
    ssr: false,
  }
);
const App: NextPage = () => {
  // For Authentication
  const [accessToken, setAccessToken] = useState("");
  const [socket, setSocket] = useState<Socket>();
  // const [recieved, setrecieved] = useState(false);
  const [cookies, setCookies] = useCookies();

  const { currentUser, allUsers, messages, sendMessage } =
    useContext(AppContext);

  const scrollToBottom: () => void = () => {
    window.scrollTo(0, document.body.scrollHeight);
  };

  useEffect(() => {
    if (cookies["access_token"] !== undefined) {
      axios.get(`http://localhost:3000/api/auth?token=${cookies["access_token"]}`)
        .then((response) => {
          if (response.data === null) {
            throw "Invalid Access Token";
            // router.push("/login");
          }
        })
        .catch((err) => {
          throw err;
        });
      setAccessToken(cookies["access_token"]);
    } else {
      router.push("/login");
    }
  }, [cookies]);

  // useEffect(() => {
  //   if (router.query.state || cookies["access_token"] !== "") {
  //     registerOnMessageCallback(onMessageReceived);
  //     registerOnSessionCallback(onSessionCreated);
  //     scrollToBottom();
  //   } else {
  //     router.push("/login");
  //   }
  //   return () => {
  //   }
  // }, [state])

  return (
    <div style={{ height: "81vh", width: "100%" }}>
      <ChatUiWindow />
    </div>
  );
};

export default App;
