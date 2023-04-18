import React from 'react';
import { useState } from 'react';
import Profile from '../Profile';
import { Flex, Box, useColorModeValue } from '@chakra-ui/react';
import styles from './index.module.css';
import { ChatItemPropsType } from '../../types';
import deleteIcon from '../../assets/icons/delete.svg';
import Image from 'next/image';

const ChatItem: React.FC<ChatItemPropsType> = ({
  image,
  name,
  toChangeUser,
  toRemoveUser,
  active,
}) => {
  const [showProfile, setShowProfile] = useState(false);

  const backgroundColor = useColorModeValue(
    'rgba(84,167,191,0.25)',
    'rgba(56, 37, 37, 0.25)'
  );

  const closingProfile = () => {
    setShowProfile(false);
  };

  return (
    <>
      <Flex
        bgColor={backgroundColor}
        className={`${styles.chatContainer}`}
        cursor="pointer"
        height="max-content"
        m="0.5rem">
        <Flex
          fontSize="35px"
          flex="1"
          alignItems="center"
          justifyContent="center">
          <Box
            borderRadius="50%"
            display="flex"
            alignItems="center"
            height="7vh"
            width="7vh"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover">
            <Image src={image} alt="" width={50} height={50} />
          </Box>
        </Flex>
        <Flex
          // onClick={() => {
          //   toChangeUser && toChangeUser(name);
          // }}
          ml="0.5rem"
          flex="4"
          alignItems="center">
          <p>{name}</p>
        </Flex>
        <Image src={deleteIcon} alt="" width={50} height={50} />
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
