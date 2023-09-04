import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextPage } from 'next';
import axios from 'axios';
//@ts-ignore
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import Menu from '../menu';
import { getInitialMsgs } from '../../utils/textUtility';
import { AppContext } from '../../context';
import keyboardIcon from '../../assets/icons/keyboard.svg';
import RightIcon from '../../assets/icons/right';
// import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image';
import { Button, Spinner } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import { useFlags } from 'flagsmith/react';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  const flags = useFlags([
    'en_example_ques_one',
    'en_example_ques_two',
    'en_example_ques_three',
    'or_example_ques_one',
    'or_example_ques_two',
    'or_example_ques_three',
  ]);
  const [messages, setMessages] = useState<Array<any>>([
    getInitialMsgs(t, flags, context?.locale),
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [showExampleMessages, setShowExampleMessages] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);

  // Show chatbox when audio recorder sends input message
  useEffect(() => {
    if (inputMsg.length > 0) {
      setShowChatBox(true);
    }
  }, [inputMsg]);

  useEffect(() => {
    setMessages([getInitialMsgs(t, flags, context?.locale)]);
  }, [t, context?.locale, flags]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Home_page');

    context?.fetchIsDown(); // check if server is down

    if (!sessionStorage.getItem('conversationId')) {
      const newConversationId = uuidv4();
      sessionStorage.setItem('conversationId', newConversationId);
      context?.setConversationId(newConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      try {
        if (!(localStorage.getItem('locale') === 'en')) {
          const words = msg.split(' ');
          // Call transliteration API
          const input = words.map((word) => ({
            source: word,
          }));

          const response = await axios.post(
            'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute',
            {
              modelId: process.env.NEXT_PUBLIC_TRANSLITERATION_MODELID,
              task: 'transliteration',
              input: input,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('transliterated msg: ', response.data.output);
          const transliteratedArray = [];
          for (const element of response.data.output) {
            transliteratedArray.push(element?.target?.[0]);
          }

          if (context?.socketSession && context?.newSocket?.connected) {
            console.log('clearing mssgs');
            context?.setMessages([]);
            router.push('/chat');
            context?.sendMessage(transliteratedArray.join(' '));
          } else {
            toast.error(t('error.disconnected'));
            return;
          }
        } else {
          if (context?.socketSession && context?.newSocket?.connected) {
            console.log('clearing mssgs');
            context?.setMessages([]);
            router.push('/chat');
            context?.sendMessage(msg);
          } else {
            toast.error(t('error.disconnected'));
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [context, t]
  );

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    setInputMsg(inputValue);
    setShowExampleMessages(inputValue.length === 0);
  };

  return (
    <>
      <div className={styles.main}>
        {/* {!(context?.socketSession && context?.newSocket?.connected) && (
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
        )} */}
        <div className={styles.title}>{t('label.ask_me')}</div>
        <div className={styles.voiceRecorder}>
          <RenderVoiceRecorder setInputMsg={setInputMsg} />
        </div>
        <div
          className={
            styles.exampleMessages +
            (showExampleMessages
              ? ` ${styles.visible}`
              : ` ${styles.invisible}`)
          }>
          {messages?.[0]?.payload?.buttonChoices?.map((choice: any) => {
            return (
              <button
                onClick={() => sendMessage(choice.text)}
                className={styles.buttonChoice}
                key={choice.key}>
                <Image
                  src={choice.img}
                  alt="img"
                  width={60}
                  height={60}
                  style={{ marginRight: '2px' }}
                />
                {choice.text}
                <div className={styles.rightIcon}>
                  <RightIcon width="45px" color="var(--secondarygreen)" />
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={(event) => event?.preventDefault()}>
          <div className={styles.inputBox}>
            {!showChatBox ? (
              <div
                className={styles.keyboard}
                onClick={() => setShowChatBox(true)}>
                <Image src={keyboardIcon} alt="keyboard" />{' '}
                <p>Click here to type</p>{' '}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  onClick={() => setShowExampleMessages(true)}
                />
                <button
                  type="submit"
                  onClick={() => sendMessage(inputMsg)}
                  className={styles.sendButton}>
                  {t('label.send')}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
      
      <Menu />
    </>
  );
};

export default HomePage;
