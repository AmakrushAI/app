'use client';
import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppContext } from '.';
import _ from 'underscore';
import { v4 as uuidv4 } from 'uuid';
import { analytics } from '../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { UserType } from '../types';
import { IntlProvider } from 'react-intl';
import { useLocalization } from '../hooks';
import toast from 'react-hot-toast';
import flagsmith from 'flagsmith/isomorphic';
import { Button, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { useFlags } from 'flagsmith/react';
import { useCookies } from 'react-cookie';
import { UCI } from 'socket-package';

function loadMessages(locale: string) {
  switch (locale) {
    case 'en':
      return import('../../lang/en.json');
    case 'or':
      return import('../../lang/or.json');
    default:
      return import('../../lang/en.json');
  }
}

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

const ContextProvider: FC<{
  locale: any;
  localeMsgs: any;
  setLocale: any;
  children: ReactElement;
}> = ({ locale, children, localeMsgs, setLocale }) => {
  const t = useLocalization();
  const flags = useFlags(['health_check_time']);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [loading, setLoading] = useState(false);
  const [isMsgReceiving, setIsMsgReceiving] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [newSocket, setNewSocket] = useState<any>();
  const [conversationId, setConversationId] = useState<string | null>(
    sessionStorage.getItem('conversationId')
  );
  const timer1 = flagsmith.getValue('timer1', { fallback: 30000 });
  const timer2 = flagsmith.getValue('timer2', { fallback: 45000 });
  const audio_playback = flagsmith.getValue('audio_playback', {
    fallback: 1.5,
  });
  const [isDown, setIsDown] = useState(false);
  const [showDialerPopup, setShowDialerPopup] = useState(false);
  // const [isConnected, setIsConnected] = useState(newSocket?.connected || false);
  const [cookie, setCookie, removeCookie] = useCookies();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [audioElement, setAudioElement] = useState(null);
  const [ttsLoader, setTtsLoader] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [clickedAudioUrl, setClickedAudioUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  const [lastMsgId, setLastMsgId] = useState('');

  const downloadChat = useMemo(() => {
    return (e: string) => {
      try {
        //@ts-ignore
        downloadHandler.postMessage(e);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  const shareChat = useMemo(() => {
    return (e: string) => {
      try {
        //@ts-ignore
        shareUrl.postMessage(e);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);

  const playAudio = useMemo(() => {
    return (url: string, content: any) => {
      if (!url) {
        console.error('Audio URL not provided.');
        return;
      }
      if (audioElement) {
        //@ts-ignore
        if (audioElement.src === url) {
          // If the same URL is provided and audio is paused, resume playback
          //@ts-ignore
          if (audioElement.paused) {
            setClickedAudioUrl(url);
            setTtsLoader(true);
            audioElement
              //@ts-ignore
              .play()
              .then(() => {
                setTtsLoader(false);
                setAudioPlaying(true);
                console.log('Resumed audio:', url);
              })
              //@ts-ignore
              .catch((error) => {
                setAudioPlaying(false);
                setTtsLoader(false);
                setAudioElement(null);
                setClickedAudioUrl(null);
                console.error('Error resuming audio:', error);
              });
          } else {
            // Pause the current audio if it's playing
            //@ts-ignore
            audioElement.pause();
            setAudioPlaying(false);
            console.log('Paused audio:', url);
          }
          return;
        } else {
          // Pause the older audio if it's playing
          //@ts-ignore
          audioElement.pause();
          setAudioPlaying(false);
        }
      }
      setClickedAudioUrl(url);
      setTtsLoader(true);
      const audio = new Audio(url);
      audio.playbackRate = audio_playback;
      audio.addEventListener('ended', () => {
        setAudioElement(null);
        setAudioPlaying(false);
      });
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/incrementaudioused/${content?.data?.messageId}`
        )
        .then((res) => {})
        .catch((err) => {
          console.log(err);
        });
      audio
        .play()
        .then(() => {
          setTtsLoader(false);
          setAudioPlaying(true);
          console.log('Audio played:', url);
          // Update the current audio to the new audio element
          //@ts-ignore
          setAudioElement(audio);
        })
        .catch((error) => {
          setAudioPlaying(false);
          setTtsLoader(false);
          setAudioElement(null);
          setClickedAudioUrl(null);
          console.error('Error playing audio:', error);
        });
    };
  }, [audioElement, audio_playback]);

  useEffect(() => {
    console.log('online');
    if (navigator.onLine) {
      console.log('online');
      setIsOnline(true);
    } else {
      console.log('online');
      setIsOnline(false);
      onMessageReceived({
        content: {
          title: t('message.no_signal'),
          choices: null,
          conversationId: conversationId,
          msg_type: 'text',
          timeTaken: 3999,
          btns: true,
        },
        messageId: uuidv4(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigator.onLine]);

  useEffect(() => {
    if (localStorage.getItem('userID') && localStorage.getItem('auth')) {
      setNewSocket(
        new UCI(
          URL,
          {
            transportOptions: {
              polling: {
                extraHeaders: {
                  Authorization: `Bearer ${localStorage.getItem('auth')}`,
                  channel: 'akai',
                },
              },
            },
            query: {
              deviceId: localStorage.getItem('userID'),
            },
            autoConnect: false,
            // transports: ['polling', 'websocket'],
            upgrade: false,
          },
          onMessageReceived
        )
      );
    }
    function cleanup() {
      if (newSocket)
        newSocket.onDisconnect(() => {
          console.log('Socket disconnected');
        });
    }
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem('userID'), localStorage.getItem('auth')]);

  const updateMsgState = useCallback(
    ({
      user,
      msg,
      media,
    }: {
      user: { name: string; id: string };
      msg: {
        content: {
          title: string;
          choices: any;
          conversationId: any;
          btns?: boolean;
          audio_url: string;
        };
        messageId: string;
      };
      media: any;
    }) => {
      if (msg.content.title !== '') {
        const newMsg = {
          username: user?.name,
          text: msg.content.title,
          choices: msg.content.choices,
          position: 'left',
          id: user?.id,
          botUuid: user?.id,
          reaction: 0,
          messageId: msg?.messageId,
          conversationId: msg?.content?.conversationId,
          sentTimestamp: Date.now(),
          btns: msg.content.btns,
          audio_url: msg.content.audio_url,
          ...media,
        };

        //@ts-ignore
        if (
          sessionStorage.getItem('conversationId') ===
          msg?.content?.conversationId
        ) {
          setMessages((prev: any) => _.uniq([...prev, newMsg], ['messageId']));
        }
      }
    },
    []
  );

  console.log('erty:', { conversationId });

  const onMessageReceived = useCallback(
    (msg: any): void => {
      console.log('mssgs:', messages);
      console.log('#-debug:', msg.content);
      console.log('#-debug:', msg.content.msg_type);
      setLoading(false);
      setIsMsgReceiving(false);
      //@ts-ignore
      const user = JSON.parse(localStorage.getItem('currentUser'));

      if (msg.content.msg_type.toUpperCase() === 'IMAGE') {
        updateMsgState({
          user,
          msg,
          media: { imageUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'AUDIO') {
        updateMsgState({
          user,
          msg,
          media: { audioUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'VIDEO') {
        updateMsgState({
          user,
          msg,
          media: { videoUrl: msg?.content?.media_url },
        });
      } else if (
        msg.content.msg_type.toUpperCase() === 'DOCUMENT' ||
        msg.content.msg_type.toUpperCase() === 'FILE'
      ) {
        updateMsgState({
          user,
          msg,
          media: { fileUrl: msg?.content?.media_url },
        });
      } else if (msg.content.msg_type.toUpperCase() === 'TEXT') {
        if (msg.content.timeTaken + 1000 < timer2 && isOnline) {
          setLastMsgId(msg?.messageId);
          setEndTime(Date.now());
          updateMsgState({ user, msg, media: {} });
        }
      }
    },
    [isOnline, messages, timer2, updateMsgState]
  );

  useEffect(() => {
    if (!lastMsgId) return;
    const timeDiff = endTime - startTime;
    console.log('time taken', timeDiff);
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/timetakenatapplication/${lastMsgId}`,
        {
          data: {
            timeTaken: timeDiff,
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    // setMessages([]);
  }, []);
  console.log('vbnmm:', { newSocket });

  //@ts-ignore
  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      if (
        !localStorage.getItem('userID') ||
        !sessionStorage.getItem('conversationId')
      ) {
        removeCookie('access_token', { path: '/' });
        location?.reload();
        return;
      }
      // console.log('mssgs:', messages)
      setLoading(true);
      setIsMsgReceiving(true);
      sessionStorage.setItem('conversationId', conversationId || '');

      //@ts-ignore
      logEvent(analytics, 'Query_sent');

      console.log('my mssg:', text);
      newSocket.sendMessage({
        text: text,
        to: localStorage.getItem('userID'),
        from: localStorage.getItem('phoneNumber'),
        optional: {
          appId: 'AKAI_App_Id',
          channel: 'AKAI',
        },
        asrId: sessionStorage.getItem('asrId'),
        userId: localStorage.getItem('userID'),
        conversationId: sessionStorage.getItem('conversationId'),
      });
      setStartTime(Date.now());
      if (isVisibile)
        if (media) {
          if (media.mimeType.slice(0, 5) === 'image') {
          } else if (media.mimeType.slice(0, 5) === 'audio' && isVisibile) {
          } else if (media.mimeType.slice(0, 5) === 'video') {
          } else if (media.mimeType.slice(0, 11) === 'application') {
          } else {
          }
        } else {
          //console.log('mssgs:',messages)
          //@ts-ignore
          setMessages((prev: any) => [
            ...prev.map((prevMsg: any) => ({ ...prevMsg, disabled: true })),
            {
              username: 'state.username',
              text: text,
              position: 'right',
              botUuid: currentUser?.id,
              payload: { text },
              time: Date.now(),
              disabled: true,
              messageId: uuidv4(),
              repliedTimestamp: Date.now(),
            },
          ]);
          sessionStorage.removeItem('asrId');
          //    console.log('mssgs:',messages)
        }
    },
    [removeCookie, newSocket, conversationId, currentUser?.id]
  );

  const fetchIsDown = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/health/${flags?.health_check_time?.value}`
      );
      const status = res.data.status;
      console.log('hie', status);
      if (status === 'OK') {
        setIsDown(false);
      } else {
        setIsDown(true);
        console.log('Server status is not OK');
      }
    } catch (error: any) {
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: error.message,
      });
    }
  }, [flags?.health_check_time?.value]);

  // Remove ASR ID from session storage on conversation change
  useEffect(() => {
    sessionStorage.removeItem('asrId');
  }, [conversationId]);

  useEffect(() => {
    if (isDown) return;
    let secondTimer: any;
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast(() => <span>{t('message.taking_longer')}</span>, {
          // @ts-ignore
          icon: <Spinner />,
        });
        secondTimer = setTimeout(() => {
          if (isMsgReceiving && loading) {
            // toast.error(`${t('message.retry')}`);
            onMessageReceived({
              content: {
                title: t('message.no_signal'),
                choices: null,
                conversationId: conversationId,
                msg_type: 'text',
                timeTaken: 3999,
                btns: true,
              },
              messageId: uuidv4(),
            });
            fetchIsDown();
            //@ts-ignore
            logEvent(analytics, 'Msg_delay', {
              user_id: localStorage.getItem('userID'),
              phone_number: localStorage.getItem('phoneNumber'),
            });
          }
        }, timer2);
      }
    }, timer1);

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [
    conversationId,
    fetchIsDown,
    isDown,
    isMsgReceiving,
    loading,
    onMessageReceived,
    t,
    timer1,
    timer2,
  ]);

  const values = useMemo(
    () => ({
      currentUser,
      allUsers: users,
      toChangeCurrentUser: onChangeCurrentUser,
      sendMessage,
      messages,
      setMessages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
      setConversationId,
      newSocket,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      playAudio,
      audioElement,
      ttsLoader,
      setTtsLoader,
      shareChat,
      clickedAudioUrl,
      downloadChat,
      audioPlaying,
      setAudioPlaying,
    }),
    [
      locale,
      setLocale,
      localeMsgs,
      currentUser,
      users,
      onChangeCurrentUser,
      sendMessage,
      messages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      setConversationId,
      newSocket,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup,
      playAudio,
      audioElement,
      ttsLoader,
      setTtsLoader,
      shareChat,
      clickedAudioUrl,
      downloadChat,
      audioPlaying,
      setAudioPlaying,
    ]
  );

  return (
    //@ts-ignore
    <AppContext.Provider value={values}>
      <IntlProvider locale={locale} messages={localeMsgs}>
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

const SSR: FC<{ children: ReactElement }> = ({ children }) => {
  const defaultLang = flagsmith.getValue('default_lang', { fallback: 'or' });
  const [locale, setLocale] = useState(
    localStorage.getItem('locale') || defaultLang
  );
  const [localeMsgs, setLocaleMsgs] = useState<Record<string, string> | null>(
    null
  );
  useEffect(() => {
    loadMessages(locale).then((res) => {
      //@ts-ignore
      setLocaleMsgs(res);
    });
  }, [locale]);

  if (typeof window === 'undefined') return null;
  return (
    //@ts-ignore
    <IntlProvider locale={locale} messages={localeMsgs}>
      <ContextProvider
        locale={locale}
        setLocale={setLocale}
        localeMsgs={localeMsgs}>
        {children}
      </ContextProvider>
    </IntlProvider>
  );
};
export default SSR;
