import styles from './index.module.css';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import leftArrow from '../../assets/icons/leftArrow.svg';
import rightArrow from '../../assets/icons/rightArrow.svg';
import Image from 'next/image';
import ChatItem from '../chat-item';
import { NextPage } from 'next';
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
import { AppContext } from '../../context';

const HistoryPage: NextPage = () => {
  const [conversations, setConversations] = useState([]);
  const flags = useFlags(['show_chat_history_page']);
  const t = useLocalization();
  const [gettingHistory, setGettingHistory] = useState(false);
  const context = useContext(AppContext);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Chat_History_page');

    setGettingHistory(true);

    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/conversations/all`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      })
      .then((res) => {
        const sortedConversations = _.filter(
          res?.data,
          (conv) => conv?.conversationId !== null
        ).sort(
          //@ts-ignore
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        //@ts-ignore
        setConversations(sortedConversations);
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
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/user/chathistory/generate-pdf/${convId}`;

      const response = await axios.post(url, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      });
      // console.log(response.data)
      const pdfUrl = response.data.pdfUrl;
      if (!pdfUrl) {
        toast.error(`${t('message.no_link')}`);
        return;
      }
      // window.open(pdfUrl)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], 'Chat.pdf', { type: blob.type });

      if (type === 'download') {
        //@ts-ignore
        logEvent(analytics, 'download_chat_clicked');
        toast.success(`${t('message.downloading')}`);
        const link = document.createElement('a');

        link.href = pdfUrl;
        link.target = '_blank';
        // link.href = window.URL.createObjectURL(blob);
        link.download = 'Chat.pdf';
        link.click();
        context?.downloadChat(pdfUrl);
      } else if (type === 'share') {

        //@ts-ignore
        logEvent(analytics, 'share_chat_clicked');

        if (!navigator.canShare) {
          //@ts-ignore
          if(window?.AndroidHandler?.shareUrl){  
            //@ts-ignore
            window.AndroidHandler.shareUrl(pdfUrl);
          }else{
            context?.shareChat(pdfUrl);
          }
        } else if (navigator.canShare({ files: [file] })) {
          toast.success(`${t('message.sharing')}`);
          await navigator
            .share({
              files: [file],
              title: 'Chat',
              text: 'Check out my chat with AmaKrushAI!',
            })
            .catch((error) => {
              toast.error(error.message);
              console.error('Error sharing', error);
            });
        } else {
          toast.error(`${t('message.cannot_share')}`);
          console.error("Your system doesn't support sharing this file.");
        }
      } else {
        console.log(response.data);
      }
    } catch (error: any) {
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: error.message,
      });

      if (
        error.message ===
        "Cannot read properties of undefined (reading 'shareUrl')"
      ) {
        toast.success(`${t('message.shareUrl_android_error')}`);
      } else toast.error(error.message);

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
          <div className={styles.chatList}>
            {gettingHistory ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '50vh',
                }}>
                {/* @ts-ignore */}
                <Spinner size="xl" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv: any) => {
                return (
                  <ChatItem
                    key={conv.id}
                    name={conv.query}
                    date={conv.updatedAt}
                    conversationId={conv.conversationId}
                    deleteConversationById={deleteConversationById}
                    downloadShareHandler={downloadShareHandler}
                  />
                );
              })
            ) : (
              <div className={styles.noHistory}>
                <div>{t('label.no_history')}</div>
                <p>{t('message.no_history')}</p>
              </div>
            )}
          </div>
        </div>
        {/* <Menu /> */}
      </>
    );
};

export default HistoryPage;
