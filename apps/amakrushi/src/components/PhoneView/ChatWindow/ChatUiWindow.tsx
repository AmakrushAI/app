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

const ChatUiWindow: FC = () => {
  const context = useContext(AppContext);

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
        type: "text",
        content: { text: msg?.text, data: { ...msg } },
        position: msg?.position ?? "right",
      })),
    [context?.messages]
  );

  return (
    <>
      {/* <FullScreenLoader loading={loading} /> */}
      <Chat
        //@ts-ignore
        messages={normalizeMsgs}
        //@ts-ignore
        renderMessageContent={(props): ReactElement => (
          <RenderComp
            key={props}
            msg={props}
            chatUIMsg={normalizeMsgs}
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
