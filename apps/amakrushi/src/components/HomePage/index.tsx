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
import sunIcon from '../../assets/icons/sun.svg';
import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image';
import { Button } from '@chakra-ui/react';
import toast from 'react-hot-toast';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  const [messages, setMessages] = useState<Array<any>>([getInitialMsgs(t)]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    setMessages([getInitialMsgs(t)]);
  }, [context.locale, t]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Home_page');
  }, []);

  const sendMessage = useCallback(
    (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      if (context?.socketSession && context?.newSocket?.connected) {
        context?.setMessages([]);
        router.push('/chat');
        context?.sendMessage(msg);
      } else {
        return;
      }
    },
    [context, t]
  );

  return (
    <>
      <div className={styles.main}>
        {!(context?.socketSession && context?.newSocket?.connected) && (
          <div className={styles.disconnected}>
            <p>You are disconnected &nbsp;</p> 
            <div
                onClick={() => {
                  context?.onSocketConnect({text: ""});
                }}
              >
                <Image src={reloadIcon} alt="reloadIcon" width={24} height={24}/>
              </div>
          </div>
        )}
        <div className={styles.sunIconContainer}>
          <Image src={sunIcon} alt="sunIcon" layout="responsive" />
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
        <form onSubmit={(event) => event?.preventDefault()}>
          <div className={styles.inputBox}>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="submit"
              onClick={() => sendMessage(inputMsg)}
              className={styles.sendButton}>
              {t('label.send')}
            </button>
          </div>
        </form>
      </div>
      <Menu />
    </>
  );
};

export default HomePage;
