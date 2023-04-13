import styles from './index.module.css';
import React from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import ChatItem from '../ChatSection/ChatItem';
import { MdMessage } from 'react-icons/md';
import { NextPage } from 'next';
import Menu from '../Menu';

const ChatsPage: NextPage = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.title}>Chats</div>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />{' '}
          </InputLeftElement>
          <Input type="text" placeholder="Search" />
        </InputGroup>
        <ChatItem image={<MdMessage />} name={'Session 1'} />
        <ChatItem image={<MdMessage />} name={'Session 2'} />
        <ChatItem image={<MdMessage />} name={'Session 3'} />
      </div>
      <Menu />
    </>
  );
};

export default ChatsPage;
