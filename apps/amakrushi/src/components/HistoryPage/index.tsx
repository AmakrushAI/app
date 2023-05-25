import styles from './index.module.css';
import React, { useCallback, useEffect, useState } from 'react';
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
import _ from 'underscore';
const HistoryPage: NextPage = () => {
  const [conversations, setConversations] = useState([]);
  const flags = useFlags(['show_chat_history_page']);
  const t = useLocalization();

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Chat_History_page');

    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/conversations`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      })
      .then((res) => {
        const sortedConversations = _.filter(
          res?.data?.userHistory,
          (conv) => conv?.conversationId !== null
        ).sort(
          //@ts-ignore
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        //@ts-ignore
        setConversations(sortedConversations);
        console.log('hie', sortedConversations);
      })
      .catch((error) => {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      });
  }, []);

  // Function to delete conversation by conversationId
  const deleteConversationById = useCallback((conversationIdToDelete: any) => {
    const filteredConversations = [...conversations].filter(
      (conversation: any) => conversation.conversationId !== conversationIdToDelete
    );
    setConversations(filteredConversations);
  }, [conversations]);
  

 
  if (!flags?.show_chat_history_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>{t('label.chats')}</div>
          {/* <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Image src={searchIcon} alt="" width={20} height={20} />
            </InputLeftElement>
            <Input type="text" placeholder="Search" />
          </InputGroup> */}
          <div>
            {conversations.length > 0
              ? conversations.map((conv: any) => {
                  return (
                    <ChatItem
                      key={conv.id}
                      name={conv.query}
                      conversationId={conv.conversationId}
                      deleteConversationById={deleteConversationById}
                    />
                  );
                })
              : (
                  <div className={styles.noHistory}>
                    <div>{t('label.no_history')}</div>
                    <p>{t('message.no_history')}</p>
                  </div>
                )}
          </div>
        </div>
        <Menu />
      </>
    );
};

export default HistoryPage;
