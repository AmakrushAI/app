import React from "react";
import { useState } from "react";
import Profile from "../Profile";
import { Flex, Box, Text, useColorModeValue } from "@chakra-ui/react";
import styles from "./ChatItem.module.css";
import { MdOutlineDelete } from "react-icons/md";

interface chatItemProps {
  image: any;
  name: string;
  toChangeUser: (name: string) => void;
  toRemoveUser: (name: string) => void;
  active: boolean;
}

const ChatItem: React.FC<chatItemProps> = ({ image, name, toChangeUser,toRemoveUser,active }) => {
  const [showProfile, setShowProfile] = useState(false);

  const bg = useColorModeValue("rgba(84,167,191,0.25)","rgba(56, 37, 37, 0.25)");

  const closingProfile = () => {
    setShowProfile(false);
  };

  return (
    <>
      <Flex bgColor={bg} className={`${styles.chatContainer}`}  cursor="pointer" height="max-content" m="0.5rem">
        <Flex
          fontSize="35px"
          flex="1"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            borderRadius="50%"
            display= 'flex'
            alignItems="center"
            height="7vh"
            width="7vh"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
          >{image}</Box>
        </Flex>
        <Flex
          // onClick={() => {
          //   toChangeUser(name);
          // }}          
          ml="0.5rem"
          // pl="0.25rem"
          flex="4"
          alignItems="center"
        >
          <p>{name}</p>
        </Flex>
        <div style={{fontSize: '2rem', display: 'flex', alignItems: 'center'}}><MdOutlineDelete/></div>
      </Flex>
      <Profile
        show={showProfile}
        name={name}
        userImg={image}
        removeProfile={closingProfile}
        toRemoveUser={toRemoveUser}
      />
    </>
  );
};

export default ChatItem;
