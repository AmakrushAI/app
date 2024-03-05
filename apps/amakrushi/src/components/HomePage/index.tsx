import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import SendIcon from '../../assets/images/sendButton.png';
// import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import router from 'next/router';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import { useFlags } from 'flagsmith/react';
import DownTimePage from '../down-time-page';
import { recordUserLocation } from '../../utils/location';
import kaliaStatusImg from '../../assets/images/kalia_status.png';
import plantProtectionImg from '../../assets/images/plant_protection.png';
import weatherAdvisoryImg from '../../assets/images/weather_advisory.png';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const inputRef = useRef(null);
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
  const voiceRecorderRef = useRef(null);
  const exampleMessagesRef = useRef(null);
  const chatBoxButton = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [transliterationConfig, setTransliterationConfig] = useState({
    auth: '',
    serviceId: '',
  });
  const [cursorPosition, setCursorPosition] = useState(0);

  const suggestionHandler = (e: any, index: number) => {
    setActiveSuggestion(index);
  };

  useEffect(() => {
    if (inputMsg.length > 0 && !(localStorage.getItem('locale') === 'en') && !context?.kaliaClicked) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }
      if (!sessionStorage.getItem('computeFetched')) {
        sessionStorage.setItem('computeFetched', 'true');
        let data = JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'transliteration',
              config: {
                language: {
                  sourceLanguage: 'en',
                  targetLanguage: 'or',
                },
              },
            },
          ],
          pipelineRequestConfig: {
            pipelineId: '64392f96daac500b55c543cd',
          },
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline',
          headers: {
            ulcaApiKey: '13900b794f-49de-4b42-8ee5-6e0289fe8833',
            userID: '737078729ae04552822e4e7e3093575c',
            'Content-Type': 'application/json',
          },
          data: data,
        };

        axios
          .request(config)
          .then((response) => {
            setTransliterationConfig({
              serviceId:
                response?.data?.pipelineResponseConfig?.[0]?.config?.[0]
                  ?.serviceId,
              auth: response?.data?.pipelineInferenceAPIEndPoint
                ?.inferenceApiKey?.value,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
      setSuggestions([]);

      const words = inputMsg.split(' ');
      const wordUnderCursor = words.find(
        (word, index) =>
          cursorPosition >= inputMsg.indexOf(word) &&
          cursorPosition <= inputMsg.indexOf(word) + word.length
      );

      if (!wordUnderCursor) return;
      let data = JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'transliteration',
            config: {
              language: {
                sourceLanguage: 'en',
                targetLanguage: 'or',
              },
              serviceId:
                transliterationConfig.serviceId ||
                'ai4bharat/indicxlit--cpu-fsv2',
              isSentence: false,
              numSuggestions: 3,
            },
          },
        ],
        inputData: {
          input: [
            {
              source: wordUnderCursor,
            },
          ],
        },
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
        headers: {
          Accept: ' */*',
          'User-Agent': ' Thunder Client (https://www.thunderclient.com)',
          Authorization:
            transliterationConfig.auth ||
            'L6zgUQ59QzincUafIoc1pZ8m54-UfxRdDKTNb0bVUDjm6z6HbXi6Nv7zxIJ-UyQN',
          'Content-Type': 'application/json',
        },
        data: data,
      };

      axios
        .request(config)
        .then((res: any) => {
          // console.log("hurray", res?.data?.output?.[0]?.target);
          setSuggestions(res?.data?.pipelineResponse?.[0]?.output?.[0]?.target);
        })
        .catch((err) => {
          console.log(err);
          toast.error('Bhashini transliteration failed');
        });
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMsg, cursorPosition]);

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
    recordUserLocation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      if (context?.newSocket?.socket?.connected) {
        console.log('clearing mssgs');
        context?.setMessages([]);
        router.push('/chat');
        if(context?.kaliaClicked){
          context?.sendMessage("Aadhar number - "+msg);
        }else context?.sendMessage(msg);
      } else {
        toast.error(t('error.disconnected'));
        return;
      }
    },
    [context, t]
  );

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    if(context?.kaliaClicked){
      if(!/^[0-9]*$/.test(inputValue) || inputValue.length > 12){
        toast.error('Please enter valid aadhaar number');
        // setInputMsg(inputValue.slice(0, 12));
      }else setInputMsg(inputValue);
    }else setInputMsg(inputValue);
    const cursorPosition = e.target.selectionStart;
    setCursorPosition(cursorPosition);
    // setShowExampleMessages(inputValue.length === 0);
    // Adjust textarea height dynamically based on content
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.style.height = 'auto';
      //@ts-ignore
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleDocumentClick = useCallback((event: any) => {
    const target = event.target;

    // Check if clicked outside voiceRecorder and exampleMessages
    if (
      //@ts-ignore
      !voiceRecorderRef.current?.contains(target) &&
      //@ts-ignore
      !chatBoxButton.current?.contains(target) &&
      //@ts-ignore
      !exampleMessagesRef.current?.contains(target)
    ) {
      // setShowExampleMessages(false);
      setSuggestions([]);
      // setShowChatBox(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleDocumentClick]);

  const suggestionClickHandler = useCallback(
    (e: any) => {
      const words = inputMsg.split(' ');

      // Find the word at the cursor position
      //@ts-ignore
      const cursorPosition = inputRef.current.selectionStart;
      let currentIndex = 0;
      let selectedWord = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (
          currentIndex <= cursorPosition &&
          cursorPosition <= currentIndex + word.length
        ) {
          selectedWord = word;
          break;
        }
        currentIndex += word.length + 1; // +1 to account for the space between words
      }

      // Replace the selected word with the transliterated suggestion
      if (selectedWord !== '') {
        const newInputMsg = inputMsg.replace(
          selectedWord,
          cursorPosition === inputMsg.length ? e + ' ' : e
        );

        setSuggestions([]);
        setSuggestionClicked(true);
        setActiveSuggestion(0);

        setInputMsg(newInputMsg);

        //@ts-ignore
        inputRef.current && inputRef.current.focus();
      }
    },
    [inputMsg]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (suggestions.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion > 0
              ? prevActiveSuggestion - 1
              : prevActiveSuggestion
          );
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion < suggestions.length - 1
              ? prevActiveSuggestion + 1
              : prevActiveSuggestion
          );
        } else if (e.key === ' ') {
          e.preventDefault();
          if (activeSuggestion >= 0 && activeSuggestion < suggestions?.length) {
            suggestionClickHandler(suggestions[activeSuggestion]);
          } else {
            setInputMsg((prevInputMsg) => prevInputMsg + ' ');
          }
        }
      }
    },
    [activeSuggestion, suggestionClickHandler, suggestions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (context?.isDown) {
    return <DownTimePage />;
  } else
    return (
      <>
        <div className={styles.main} onClick={handleDocumentClick}>
          <div className={styles.title}>{t('label.ask_me')}</div>
          <div className={styles.imgButtons}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                width: '100%',
                maxWidth: '500px',
              }}>
              <div className={styles.imgBtn} onClick={() => {context?.setKaliaClicked((props: boolean) => !props);}}>
                <p>KALIA status</p>
                <Image
                  src={kaliaStatusImg}
                  width={80}
                  height={57}
                  alt="kaliastatus"
                />
              </div>
              <div className={styles.imgBtn} onClick={() => {
                toast('Coming Soon!')
              }}>
                <p>Plant Protection</p>
                <Image
                  src={plantProtectionImg}
                  width={60}
                  height={60}
                  alt="plantprotection"
                />
              </div>
            </div>
            <div className={styles.imgBtn} style={{ marginTop: '20px' }} onClick={() => {
              sendMessage('weather advisory');
            }}>
              <p>Weather Advisory</p>
              <Image
                src={weatherAdvisoryImg}
                width={50}
                height={70}
                alt="weatheradvisory"
              />
            </div>
          </div>
          <div className={styles.voiceRecorder} ref={voiceRecorderRef}>
            <RenderVoiceRecorder setInputMsg={setInputMsg} tapToSpeak={true} />
          </div>

          {/* <div
            className={
              styles.exampleMessages +
              (showExampleMessages
                ? ` ${styles.visible}`
                : ` ${styles.invisible}`)
            }
            ref={exampleMessagesRef}>
            {messages?.[0]?.payload?.buttonChoices?.map((choice: any) => {
              return (
                <button
                  // onClick={() => {
                  //   sendMessage(choice.text);
                  //   console.log('clicked');
                  // }}
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
                    <RightIcon width="35px" color="var(--secondarygreen)" />
                  </div>
                </button>
              );
            })}
          </div> */}
          <div
            ref={chatBoxButton}
            className={`${`${styles.inputBox} ${styles.inputBoxOpen}`}`}>
            <div className={styles.suggestions}>
              {suggestions.map((elem, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => suggestionClickHandler(elem)}
                    className={`${styles.suggestion} ${
                      activeSuggestion === index ? styles.active : ''
                    }`}
                    onMouseEnter={(e) => suggestionHandler(e, index)}>
                    {elem}
                  </div>
                );
              })}
            </div>
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMsg}
              onChange={handleInputChange}
              placeholder={!context?.kaliaClicked ? placeholder: 'Enter you Aadhar number'}
            />
            <button type="submit" className={styles.sendButton}>
              <Image
                src={SendIcon}
                width={50}
                height={50}
                alt="sendIcon"
                onClick={() => sendMessage(inputMsg)}
              />
            </button>
          </div>
        </div>
      </>
    );
};
export default HomePage;
