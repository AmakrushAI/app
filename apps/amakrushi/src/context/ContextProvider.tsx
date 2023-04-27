"use client";
import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppContext } from ".";
import _ from "underscore";
import { v4 as uuidv4 } from 'uuid';
import { send } from "../socket";

import { UserType } from "../types";
import { IntlProvider } from "react-intl";
import { useLocalization } from "../hooks";
import toast from "react-hot-toast";
import flagsmith from "flagsmith/isomorphic";
import { io } from "socket.io-client";
import { Button } from "@chakra-ui/react";

function loadMessages(locale: string) {
  switch (locale) {
    case "en":
      return import("../../lang/en.json");
    case "or":
      return import("../../lang/or.json");
    default:
      return import("../../lang/en.json");
  }
}

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
}> = ({ locale, children, localeMsgs, setLocale }) => {
  const t = useLocalization();

  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [socketSession, setSocketSession] = useState<any>();
  const [newSocket, setNewSocket] = useState<any>();
  const [conversationId,setConversationId]=useState<string|null>(localStorage.getItem('conversationId') ? localStorage.getItem('conversationId') : uuidv4())
  const [isMobileAvailable, setIsMobileAvailable] = useState(
    localStorage.getItem("phoneNumber") ? true : false || false
  );
  const timer1 = flagsmith.getValue("timer1", { fallback: 5000 });
  const timer2 = flagsmith.getValue("timer2", { fallback: 25000 });

  const [isConnected, setIsConnected] = useState(newSocket?.connected || false);
  console.log(messages);

  useEffect(() => {
    if (
      (localStorage.getItem("phoneNumber") && localStorage.getItem("auth")) ||
      isMobileAvailable
    ) {
      setNewSocket(
        io(URL, {
          transportOptions: {
            polling: {
              extraHeaders: {
                 Authorization: `Bearer ${localStorage.getItem("auth")}`,
                //Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im9yQ1h5ZUFkaVIxSm9KaFlhUUJlTkpISHd6RSJ9.eyJhdWQiOiI3YTZjODJlOS1kNTM5LTRkZTktOGY1OC0zZGRlNjc4OTRkZGUiLCJleHAiOjE2ODI1MjExODksImlhdCI6MTY4MjUxNzU4OSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiI4MGFkNGRjOC0zNzdkLTQyNGQtYjYyNS1hMGIyZDgyNjZkM2UiLCJqdGkiOiI4YWNiNjE4ZC0xNzZjLTQ5ZGUtODZhZC02NGFlYWEzMGFiOGQiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsInByZWZlcnJlZF91c2VybmFtZSI6Ijk2NDA4NjMyMDYiLCJhcHBsaWNhdGlvbklkIjoiN2E2YzgyZTktZDUzOS00ZGU5LThmNTgtM2RkZTY3ODk0ZGRlIiwicm9sZXMiOlsiRmFybWVyIl0sImF1dGhfdGltZSI6MTY4MjUxNzU4OSwidGlkIjoiMjA1MTIxMmEtMTgxYS0wYTliLTM4YmItZTlkNGE0MzUxMTIyIn0.DXz-ArTh0HX7OW9dg78V7VPRieRVLXuAs7t7pKlrWFJp_W6vTn54atvntJZGD2w0toVTTJeCLXp553PXqhWoigZgwiQdFbaGs6Cy_fr6bOsZF3Qo27b9qrXRQ-9d6i02QfLD6Dc5QTuOGKjrdSLNzpTzK8FNGDn4crRAh2O4HwojPatCmiHJJ19uhdupBSfs1So9HnWYjDPheoV_ZU2EjrQJjvLg0SIqehMkMQIfLpQv4vqpZgCa6t5NIiZkzbJk63xMVEFN4VXWcd-hC1Vtvnl7ly7cfh_m1xPFm5Fiid3PbzMlupmAndutfrhWUyC4dnSIO1l-LALcv7XR5SvNUg`,
                channel: "akai",
              },
            },
          },
          query: {
            deviceId: `akai:${localStorage.getItem("phoneNumber")}`,
          },
          autoConnect: false,
          // transports: ['polling', 'websocket'],
          upgrade: false,
        })
      );
    }
  }, [isMobileAvailable]);

  const updateMsgState = useCallback(
    ({
      user,
      msg,
      media,
    }: {
      user: { name: string; id: string };
      msg: { content: { title: string; choices: any }; messageId: string };
      media: any;
    }) => {
      if (msg.content.title !== "") {
        const newMsg = {
          username: user?.name,
          text: msg.content.title,
          choices: msg.content.choices,
          position: "left",
          id: user?.id,
          botUuid: user?.id,
          messageId: msg?.messageId,
          sentTimestamp: Date.now(),
          ...media,
        };
        setMessages((prev: any) => _.uniq([...prev, newMsg], ["messageId"]));
      }
    },
    []
  );

 

  const onMessageReceived = useCallback(
    (msg: any): void => {
      console.log("#-debug:", { msg });
      setLoading(false);
      setIsMsgReceiving(false);

      //@ts-ignore
      const user = JSON.parse(localStorage.getItem("currentUser"));

      if (msg.content.msg_type.toUpperCase() === "IMAGE") {
        updateMsgState({
          user,
          msg,
          media: { imageUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === "AUDIO") {
        updateMsgState({
          user,
          msg,
          media: { audioUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === "VIDEO") {
        updateMsgState({
          user,
          msg,
          media: { videoUrl: msg?.content?.media_url },
        });
      } else if (
        msg.content.msg_type.toUpperCase() === "DOCUMENT" ||
        msg.content.msg_type.toUpperCase() === "FILE"
      ) {
        updateMsgState({
          user,
          msg,
          media: { fileUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === "TEXT") {
        updateMsgState({ user, msg, media: {} });
      }

      localStorage.setItem(
        "userMsgs",
        JSON.stringify([
          ...messages,
          {
            username: "akai",
            text: msg.content.title,
            choices: msg.content.choices,
            position: "left",
          },
        ])
      );
    },
    [messages, updateMsgState]
  );

   //@ts-ignore
  const onSocketConnect=useCallback(({text}:{text:string}):void=>{
    setIsConnected(false);
    setTimeout(() => {
      newSocket?.connect();
      setIsConnected(true);
    }, 30);
    
    setTimeout(()=>{
      if(newSocket?.connected)
      sendMessage(text,null);
    },40)
    //@ts-ignore
  },[newSocket, sendMessage]);

  
  useEffect(() => {
    if (!isConnected && newSocket && !newSocket.connected) {
      newSocket.connect();
      setIsConnected(true);
    }
  }, [isConnected, newSocket]);

  useEffect(() => {
    function onConnect(): void {
      setIsConnected(true);
    }

    function onDisconnect(): void {
      setIsConnected(false);
    }

    function onSessionCreated(sessionArg: { session: any }) {
      setSocketSession(sessionArg);
    }

    function onException(exception: any) {
      toast.error(exception?.message);
    }

    if (newSocket) {
      newSocket.on("connect", onConnect);
      newSocket.on("disconnect", onDisconnect);
      newSocket.on("botResponse", onMessageReceived);

      newSocket.on("exception", onException);
      newSocket.on("session", onSessionCreated);
    }

    return () => {
      if (newSocket) {
        // if (isSocketReady && isConnected) {
        //   console.log("debug: return")
        // newSocket.disconnect();
        //socket?.off("connect", );
        newSocket.off("disconnect", onDisconnect);
        // socket?.off("botResponse", onMessageReceived);
        // socket?.off("session", () => setSocketSession(null));
        // }
      }
    };
  }, [isConnected, newSocket, onMessageReceived]);

  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    localStorage.removeItem("userMsgs");
    setMessages([]);
  }, []);

  //@ts-ignore
  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      setLoading(true);
      setIsMsgReceiving(true);

      if (newSocket && !socketSession) {
        toast(
          (to) => (
            <span>
              <Button
                onClick={() => {
                  onSocketConnect({text});
                  toast.dismiss(to.id);
                }}
              >
                {t("label.click")}
              </Button>
              {t("message.socket_disconnect_msg")}
            </span>
          ),
          {
            icon: "",
            duration: 10000,
          }
        );
        return;
      }
      send({ text, socketSession, socket: newSocket,conversationId });
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
                username: "User",
                text: text,
                position: "right",
                botUuid: currentUser?.id,
                disabled: true,
              },
            ])
          );

          //@ts-ignore
          setMessages((prev: any) => [
            ...prev.map((prevMsg: any) => ({ ...prevMsg, disabled: true })),
            {
              username: "state.username",
              text: text,
              position: "right",
              botUuid: currentUser?.id,
              payload: { text },
              time: Date.now(),
              disabled: true,
              messageId: uuidv4(),
              repliedTimestamp: Date.now(),
            },
          ]);
        }
    },
    [t, newSocket, socketSession, conversationId, onSocketConnect, messages, currentUser?.id]
  );  

  useEffect(() => {
    if (!socketSession && newSocket) {
      console.log("vbn:", { socketSession, newSocket });
    }
  }, [newSocket, socketSession]);
 
 
  console.log("vbn: aa", {
    socketSession,
    newSocket,
    isConnected,
    isMobileAvailable,
  });

  useEffect(() => {
    let secondTimer: any;
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast.error(`${t("message.taking_longer")}`);
        secondTimer = setTimeout(() => {
          if (isMsgReceiving && loading) {
            toast.error(`${t("message.retry")}`);
            setIsMsgReceiving(false);
            setLoading(false);
          }
        }, timer2);
      }
    }, timer1);

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [isMsgReceiving, loading, t, timer1, timer2]);

  const values = useMemo(
    () => ({
      currentUser,
      allUsers: users,
      toChangeCurrentUser: onChangeCurrentUser,
      sendMessage,
      messages,
      setMessages,
      loading,
      setLoading,
      socketSession,
      isMsgReceiving,
      setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
      isMobileAvailable,
      setIsMobileAvailable,
      setConversationId,onSocketConnect
    }),
    [
      locale,
      isMobileAvailable,
      setIsMobileAvailable,
      setLocale,
      localeMsgs,
      currentUser,
      socketSession,
      users,
      onChangeCurrentUser,
      sendMessage,
      messages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      setConversationId,onSocketConnect
    ]
  );

  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
      <IntlProvider locale={locale} messages={localeMsgs}>
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

const SSR: FC<{ children: ReactElement }> = ({ children }) => {
  const defaultLang = flagsmith.getValue("default_lang", { fallback: "en" });
  const [locale, setLocale] = useState(
    localStorage.getItem("locale") || defaultLang
  );
  const [localeMsgs, setLocaleMsgs] = useState<Record<string, string> | null>(
    null
  );
  useEffect(() => {
    loadMessages(locale).then((res) => {
      //@ts-ignore
      setLocaleMsgs(res);
    });
  }, [locale]);

  if (typeof window === "undefined") return null;
  return (
    //@ts-ignore
    <IntlProvider locale={locale} messages={localeMsgs}>
      <ContextProvider
        locale={locale}
        setLocale={setLocale}
        localeMsgs={localeMsgs}
      >
        {children}
      </ContextProvider>
    </IntlProvider>
  );
};
export default SSR;
