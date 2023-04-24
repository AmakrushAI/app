import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextPage } from 'next';

//@ts-ignore
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import Menu from '../menu';
import { getInitialMsgs } from '../../utils/textUtility';
import { AppContext } from '../../context';
import RightIcon from '../../assets/icons/right';
import sunIcon from '../../assets/icons/sun.svg'
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image'

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  const [messages, setMessages] = useState<Array<any>>([
    getInitialMsgs(context?.locale),
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    setMessages([getInitialMsgs(context?.locale)]);
    if(localStorage.getItem('phoneNumber')){
      context?.setIsMobileAvailable(true);
    }
  }, [context, context?.locale]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Home_page');
  }, []);

  const sendMessage = useCallback((msg: string) => {
    router.push('/chat');
    context?.sendMessage(msg);
  }, [context]);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.sunIconContainer}>
          <Image src={sunIcon} alt="sunIcon" layout='responsive'/>
        </div>
        <div className={styles.title}>{messages?.[0]?.payload?.text}</div>
        {messages?.[0]?.payload?.buttonChoices?.map((choice: any) => {
          return (
            <button
              onClick={() => sendMessage(choice.text)}
              className={styles.buttonChoice}
              key={choice.key}>
              {choice.text}
              <div className={styles.rightIcon}>
                <RightIcon width="5.5vh" color="var(--secondarygreen)" />
              </div>
            </button>
          );
        })}
        <div className={styles.inputBox}>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={placeholder}
          />
          <button
            onClick={() => sendMessage(inputMsg)}
            className={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
      <Menu />
    </>
  );
};

export default HomePage;
