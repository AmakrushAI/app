//@ts-ignore
import Chat from "chatui";

import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { RenderComp } from "./Comps";
import { AppContext } from "../../../context";
import { getMsgType } from "../../../utils/getMsgType";

const ChatUiWindow: FC = () => {
  const context = useContext(AppContext);

  const handleSend = useCallback(
    (type: string, val: any) => {
      if (type === "text" && val.trim()) {
        context?.sendMessage(val.trim());
        console.log(context);
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
    <>
      {/* <FullScreenLoader loading={loading} /> */}
      <Chat
        btnColor='var(--secondarygreen)'
        background='var(--bg-color)'
        disableSend={context?.loading}
        //@ts-ignore
        messages={msgToRender}
        //@ts-ignore
        renderMessageContent={(props): ReactElement => (
          <RenderComp
            key={props}
            msg={props}
            chatUIMsg={msgToRender}
            currentUser={context?.currentUser}
            onSend={handleSend}
          />
        )}
        onSend={handleSend}
        locale="en-US"
        placeholder="Ask Your Question"
      />
    </>
  );
};

export default ChatUiWindow;
