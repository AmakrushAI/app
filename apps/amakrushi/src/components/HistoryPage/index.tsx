import styles from './index.module.css';
import React, { useEffect, useState } from 'react';
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
import axios from 'axios';

const HistoryPage: NextPage = () => {
  const [conversations, setConversations] = useState([]);
  const flags = useFlags(['show_chat_history_page']);
  const t = useLocalization();

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Chat_History_page');

    axios
      .get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/user/conversations/${localStorage.getItem('userID')}`
      )
      .then((res) => {
        setConversations(res?.data);
        console.log('conversations:', res);
      })
      .catch((error) => {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      });
  }, []);

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
          <div>
            {conversations.map((conv, key) => {
              return (
                <ChatItem
                  key={key}
                  name={conv.query}
                  conversationId={conv.conversationId}
                />
              );
            })}
          </div>
        </div>
        <Menu />
      </>
    );
};

export default HistoryPage;
