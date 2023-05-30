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

import RightIcon from '../../assets/icons/right';
import sunIcon from '../../assets/icons/sun.svg';
import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image';
import { Button } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import englishDictionary from '../../../eng_words_dictionary.json';

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
      // Function to check if a word is an English word
      const isEnglishWord = (word: string) => {
        // Assuming you have a dictionary of English words called "englishDictionary"
        return englishDictionary.hasOwnProperty(word.toLowerCase());
      };
      try {
        const words = msg.split(' ');
        const englishWordCount = words.filter(isEnglishWord).length;
        const englishWordPercentage = englishWordCount / words.length;

        if (englishWordPercentage > 0.5) {
          console.log('skipping transliteration, english detected')
          // More than 50% of words are English, skip transliteration
          if (context?.socketSession && context?.newSocket?.connected) {
            console.log('clearing mssgs');
            context?.setMessages([]);
            router.push('/chat');
            context?.sendMessage(msg);
          } else {
            toast.error(t('error.disconnected'));
            return;
          }
        } else {
          // Call transliteration API
          const input = words.map((word) => ({
            source: word,
          }));

          const response = await axios.post(
            'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute',
            {
              modelId: '62b042b878d51611abf708c7',
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
        }
      } catch (error) {
        console.error(error);
      }
    },
    [context, t]
  );

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
            <div>
              <RenderVoiceRecorder setInputMsg={setInputMsg} />
            </div>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={placeholder}
            />
            {/* <button
              onClick={() => handleTransliterate(inputMsg)}
              className={styles.transliterateButton}>
              {t('label.transliterate')}
            </button> */}
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
