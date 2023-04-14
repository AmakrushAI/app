
import axios from "axios";
//@ts-ignore
import Chat from "chatui";
import { NextComponentType, NextPage } from "next";
import { useRouter } from "next/router";

import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCookies } from "react-cookie";

import { AppContext } from "../../../context";
import { getMsgType } from "../../../utils/getMsgType";
import ChatMessageItem from "../../chat-message-item";

const ChatUiWindow: NextPage = () => {
 
  const context = useContext(AppContext);
  const router=useRouter();

  const [accessToken, setAccessToken] = useState("");
  const [cookies, setCookies] = useCookies();


  useEffect(() => {
    if (cookies["access_token"] !== undefined) {
      axios.get(`http://localhost:3000/api/auth?token=${cookies["access_token"]}`)
        .then((response) => {
          if (response.data === null) {
            throw "Invalid Access Token";
             router.push("/login");
          }
        })
        .catch((err) => {
          throw err;
        });
      setAccessToken(cookies["access_token"]);
    } else {
      router.push("/login");
    }
  }, [cookies, router]);

  const handleSend = useCallback(
    (type: string, val: any) => {
      if (type === "text" && val.trim()) {
        context?.sendMessage(val.trim());
      }
    },
    [context]
  );

  const normalizeMsgs = useMemo(
    () =>
      context?.messages?.map((msg: any) => ({
        type: getMsgType(msg),
        content: { text: msg?.text, data: { ...msg } },
        position: msg?.position ?? "right",
      })),
    [context?.messages]
  );
 
  const msgToRender=useMemo(()=>{
   return context?.isMsgReceiving ? [...normalizeMsgs,{
      type:'loader',
      position: 'left',
      botUuid: '1',
    }] : normalizeMsgs
  },[context?.isMsgReceiving,normalizeMsgs]);

  console.log("debug:",{msgToRender})
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      {/* <FullScreenLoader loading={loading} /> */}
      <Chat
        disableSend={context?.loading}
        //@ts-ignore
        messages={msgToRender}
        //@ts-ignore
        renderMessageContent={(props): ReactElement => (
          <ChatMessageItem
            key={props}
            message={props}
            currentUser={context?.currentUser}
            onSend={handleSend}
          />
        )}
        onSend={handleSend}
        locale="en-US"
        placeholder="Ask Your Question"
      />
    </div>
  );
};

export default ChatUiWindow;
