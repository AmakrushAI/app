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

import { send } from "../components/websocket";

import { UserType } from "../types";
import { IntlProvider } from "react-intl";
import { getInitialMsgs } from "../utils/textUtility";
import { useLocalization, useSocket } from "../hooks";
import toast from "react-hot-toast";
import { useFlags } from "flagsmith/react";
import flagsmith from "flagsmith/isomorphic";

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

const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
}> = ({ locale, children, localeMsgs, setLocale }) => {
  const t = useLocalization();
  const [isMobileAvailable, setIsMobileAvailable] = useState<boolean>(false);
  const [socket, isSocketReady] = useSocket(isMobileAvailable);

  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [socketSession, setSocketSession] = useState<any>();
 
  const timer1 = flagsmith.getValue("timer1", { fallback: 5000 });
  const timer2 = flagsmith.getValue("timer2", { fallback: 25000 });

  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  console.log(messages);

  const connect = useCallback((): void => {
    console.log("socket debug: socket?.connect triggered");
    socket?.connect();
  }, [socket]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isConnected && isSocketReady)
      connect();
  }, [connect, isConnected, isSocketReady]);

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
      setMessages((prev: any) => [...prev, newMsg]);
    },
    []
  );
console.log("debug dd:",{isMobileAvailable})
  const onMessageReceived = useCallback(
    (msg: any): void => {
      console.log("debug:", { msg });
      setLoading(false);
      setIsMsgReceiving(false);
      // @ts-ignore
      const user = JSON.parse(localStorage.getItem("currentUser"));
      //  console.log("qwe12 message: ", { msg, currentUser, uu: JSON.parse(localStorage.getItem('currentUser')) });
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
            username: "AI",
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
    setSocketSession(sessionArg);
  }, []);

  const onException = useCallback((exception: any) => {
    toast.error(exception?.message);
  }, []);

  useEffect(() => {
    function onConnect(): void {
      console.log("socket:  onConnect callback");
      setIsConnected(true);
    }

    function onDisconnect(): void {
      console.log("socket: disconnecting");
      setIsConnected(false);
    }
    if (isSocketReady && !isConnected) {
      console.log("debug dd: if socket ready");
      socket?.on("connect", onConnect);
      socket?.on("disconnect", onDisconnect);
      socket?.on("botResponse", onMessageReceived);

      socket?.on("exception", onException);
      socket?.on("session", onSessionCreated);
    }

    return () => {
      // if (isSocketReady && isConnected) {
      //   console.log("debug: return")
      //  socket?.disconnect();
      //socket?.off("connect", );
      // socket?.off("disconnect", onDisconnect);
      // socket?.off("botResponse", onMessageReceived);
      //socket?.off("session", () => setSocketSession(null));
      // }
    };
  }, [
    isConnected,
    isSocketReady,
    onException,
    onMessageReceived,
    onSessionCreated,
    socket,
  ]);
  console.log("debug dd:", { isConnected, isSocketReady, socket });
  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    localStorage.removeItem("userMsgs");
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      setLoading(true);
      setIsMsgReceiving(true);
      // To disappear the example choices even if not clicked and msg sent directly
      // if (messages?.[0]?.exampleOptions) {
      //   setMessages([]);
      // }

      send({ text, socketSession, socket });
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
              repliedTimestamp: Date.now(),
            },
          ]);
        }
    },
    [currentUser, messages, socket, socketSession]
  );

  useEffect(() => {
    let secondTimer: any;
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast.error(t("message.taking_longer"));
        secondTimer = setTimeout(() => {
          if (isMsgReceiving && loading) {
            toast.error(t("message.retry"));
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
    }),
    [
      locale,
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
      isMobileAvailable,
      setIsMobileAvailable,
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
