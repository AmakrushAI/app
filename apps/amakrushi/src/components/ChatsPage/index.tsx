import styles from './index.module.css';
import React, { useEffect } from 'react';
import searchIcon from '../../assets/icons/search.svg';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import ChatItem from '../chat-item';
import { NextPage } from 'next';
import Image from 'next/image';

//@ts-ignore
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import Menu from '../menu';
import { useLocalization } from '../../hooks';
import ComingSoonPage from '../coming-soon-page';
import { useFlags } from 'flagsmith/react';

const ChatsPage: NextPage = () => {
  const flags = useFlags(['show_chat_history_page']);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Chat_History_page');
  }, []);
  const t = useLocalization();

  if (!flags?.show_chat_history_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>{t('label.chats')}</div>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
            <Image src={searchIcon} alt="" width={20} height={20} />
            </InputLeftElement>
            <Input type="text" placeholder="Search" />
          </InputGroup>
          <ChatItem name={'Session 1'} />
          <ChatItem name={'Session 2'} />
          <ChatItem name={'Session 3'} />
        </div>
        <Menu />
      </>
    );
};

export default ChatsPage;
