import React from 'react';
import styles from './index.module.css';
import { ChatItemPropsType } from '../../types';
import messageIcon from '../../assets/icons/message.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import Image from 'next/image';

const ChatItem: React.FC<ChatItemPropsType> = ({ name }) => {
  return (
    <>
      <div className={styles.chatContainer}>
        <div className={styles.messageIconContainer}>
          <Image src={messageIcon} alt="messageIcon" />
        </div>
        <div className={styles.name}>{name}</div>
        <div className={styles.deleteIconContainer}>
          <Image src={deleteIcon} alt="deleteIcon" />
        </div>
      </div>
    </>
  );
};

export default ChatItem;
