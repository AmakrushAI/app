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

import { toast } from "react-toastify";
import { send } from "../components/websocket";
import moment from "moment";
import { socket } from "../socket";
import { UserType } from "../types";
import { IntlProvider } from "react-intl";
import { getInitialMsgs } from "../utils/textUtility";
import { useLocalization } from "../hooks";
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

const ContextProvider: FC<{locale:any,localeMsgs:any,setLocale:any, children: ReactElement }> = ({locale, children,localeMsgs,setLocale }) => {
  const t=useLocalization();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([getInitialMsgs(locale)]);
  const [socketSession, setSocketSession] = useState<any>();
 
  const [isConnected, setIsConnected] = useState(socket.connected);
  console.log(messages);

  useEffect(()=>{},)
  const connect = (): void => {
    console.log("socket: socket.connect triggered");
    socket.connect();
  };
console.log("mnop:",{locale})
  
  useEffect(() => {
    if (typeof window !== "undefined" && !isConnected) connect();
  }, [isConnected]);
  

  

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
        sentTimestamp: moment(),
        ...media,
      };
      setMessages((prev: any) => [...prev, newMsg]);
    },
    []
  );

  const onMessageReceived = useCallback(
    (msg: any): void => {
      console.log("socket ss:", { msg });
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

  console.log("socket:", { socketSession });
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
      socket.off("session", () => setSocketSession("hello"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onException, onSessionCreated]);

  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    localStorage.removeItem("userMsgs");
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      //  alert('hello')
      console.log("socket:", { socketSession });
      setLoading(true);
      setIsMsgReceiving(true);
      // To disappear the example choices even if not clicked and msg sent directly
      if (messages?.[0]?.exampleOptions) {
        setMessages([]);
      }
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
            ...prev.map((prevMsg:any) => ({ ...prevMsg, disabled: true })),
          
           // ..._.map(prev, (prevMsg) => ({ ...prevMsg, disabled: true })),
            {
              username: "state.username",
              text: text,
              position: "right",
              botUuid: currentUser?.id,
              payload: { text },
              time: moment().valueOf(),
              disabled: true,
              repliedTimestamp: moment(),
            },
          ]);
        }
    },
    [currentUser, messages, socketSession]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast.error("Please wait, servers are busier than usual.");
      }
    }, 25000);

    return () => clearTimeout(timer);
  }, [isMsgReceiving, loading, onMessageReceived]);

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
  const [locale, setLocale] = useState(localStorage.getItem('locale') || "en");
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
  return  <IntlProvider locale={locale} messages={localeMsgs}> <ContextProvider locale={locale} setLocale={setLocale} localeMsgs={localeMsgs}>{children}</ContextProvider> </IntlProvider>;
};
export default SSR;
