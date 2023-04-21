import React, { useCallback, useContext } from 'react';
import styles from './index.module.css';
import { ChatItemPropsType } from '../../types';
import messageIcon from '../../assets/icons/message.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import Image from 'next/image';
import router from 'next/router';
import { AppContext } from '../../context';

const ChatItem: React.FC<ChatItemPropsType> = ({ name, messages }) => {
  const context = useContext(AppContext);

  const handleChatPage = useCallback(
    (messages: any) => {
      context?.setMessages(messages);
      router.push('/chat');
    },
    [context]
  );

  const deleteSession = useCallback((name: string) => {
    console.log('here', name)
    // Get the history object from localStorage
    const storageHistory = JSON.parse(localStorage.getItem('history') || "{}");

    // Create a copy of the history object
    const newHistory = { ...storageHistory };

    // Check if the session exists in the history
    if (newHistory.hasOwnProperty(name)) {
      // Delete the session property
      delete newHistory[name];
      console.log('here', newHistory)

      // Update localStorage with the deleted session
      localStorage.setItem('history', JSON.stringify(newHistory));
      router.push('/history');
    }
  }, []);

  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.sessionContainer} onClick={() => handleChatPage(messages)}>
          <div className={styles.messageIconContainer}>
            <Image src={messageIcon} alt="messageIcon" />
          </div>
          <div className={styles.name}>{name}</div>
        </div>
        <div
          onClick={() => deleteSession(name)}
          className={styles.deleteIconContainer}>
          <Image src={deleteIcon} alt="deleteIcon" />
        </div>
      </div>
    </>
  );
};

export default ChatItem;
