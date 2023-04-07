import React, { useContext } from "react";
import { Box, Flex, Button } from "@chakra-ui/react";
import styles from "./index.module.css";
import MessageWindow from "../../MessageWindow";
import TextBar from "../../TextBar";
import ColorModeSwitcher from "../../ColorModeSwitcher";
import { useColorModeValue, IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShower } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import { AppContext } from "../../../context";

const ChatUiWindow = dynamic(() => import("./ChatUiWindow"), {
  ssr: false,
});
const FontSizeChanger = dynamic(
  () => {
    return import("react-font-size-changer");
  },
  { ssr: false }
);

interface chatWindowProps {
  currentMessageObj: {
    user: string;
    phoneNumber: string | null;
    messages: any[];
  };
  toClearChat: () => void;
  messages: any[];
  username: string;
  selected: (option: { key: string; text: string; backmenu: boolean }) => void;
  toSendMessage: (text: string, media: any) => void;
  currentUser: { name: string; number: string | null };
  sendLocation: (location: string) => void;
  toShowChats: (event: React.MouseEvent) => void;
}

const ChatWindow: React.FC<chatWindowProps> = ({

  currentMessageObj,
  messages,
 
  toSendMessage,
  currentUser,
 
}) => {
const context=useContext(AppContext);
console.log("qwerty:",{context})
  return (
    <>
      <div style={{ height: "88vh", width: "100%" }}>
        <ChatUiWindow
          currentUser={currentUser}
          messages={messages}
          currentMessageObj={currentMessageObj}
          onSend={toSendMessage}
        />
      </div>
    </>
   
  );
};

export default ChatWindow;
