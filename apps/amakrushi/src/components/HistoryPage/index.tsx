import styles from './index.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import searchIcon from '../../assets/icons/search.svg';
import { Input, InputGroup, InputLeftElement, Spinner } from '@chakra-ui/react';
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
import { toast } from 'react-hot-toast';
const HistoryPage: NextPage = () => {
  const [conversations, setConversations] = useState([]);
  const flags = useFlags(['show_chat_history_page']);
  const t = useLocalization();
  const [gettingHistory, setGettingHistory] = useState(false);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Chat_History_page');

    setGettingHistory(true);

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
        setGettingHistory(false);
      })
      .catch((error) => {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
        setGettingHistory(false);
      });
  }, []);

  // Function to delete conversation by conversationId
  const deleteConversationById = useCallback(
    (conversationIdToDelete: any) => {
      const filteredConversations = [...conversations].filter(
        (conversation: any) =>
          conversation.conversationId !== conversationIdToDelete
      );
      setConversations(filteredConversations);
    },
    [conversations]
  );

  const downloadShareHandler = async (type: string, convId: any) => {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/user/chathistory/generate-pdf/${convId}`;

      const response = await axios.post(url, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
        responseType: 'arraybuffer', // This is important to handle binary data
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], 'Chat.pdf', {type: blob.type});

      if (type === 'download') {
        toast.success("Downloading...");
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'Chat.pdf';
        link.click();
      } else if (type === 'share') {
        if (navigator.canShare({ files: [file] })) {
          toast.success("Sharing...");
          await navigator
            .share({
              files: [file],
              title: 'Chat',
              text: 'Check out my chat with AmaKrushAI!',
            })
            .catch((error) => {
              toast.error(error);
              console.error('Error sharing', error);
            });
        } else {
          toast.error("Your system doesn't support sharing this file.");
          console.error("Your system doesn't support sharing this file.");
        }
      } else {
        console.log(response.data);
      }
    } catch (error: any) {
      toast.error(error);
      console.error(error);
    }
  };

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
          <div style={{minHeight: '80vh'}}>
            {conversations.length > 0 ? (
              conversations.map((conv: any) => {
                return (
                  <ChatItem
                    key={conv.id}
                    name={conv.query}
                    conversationId={conv.conversationId}
                    deleteConversationById={deleteConversationById}
                    downloadShareHandler={downloadShareHandler}
                  />
                );
              })
            ) : gettingHistory ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                 {/* @ts-ignore */}
                <Spinner size="xl" />
              </div>
            ) : (
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
