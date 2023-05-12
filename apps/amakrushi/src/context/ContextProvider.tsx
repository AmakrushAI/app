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
import { send } from '../socket';
import { analytics } from '../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { UserType } from '../types';
import { IntlProvider } from 'react-intl';
import { useLocalization } from '../hooks';
import toast from 'react-hot-toast';
import flagsmith from 'flagsmith/isomorphic';
import { io } from 'socket.io-client';
import { Button } from '@chakra-ui/react';
import axios from 'axios';
import { useFlags } from 'flagsmith/react';

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
  const [socketSession, setSocketSession] = useState<any>();
  const [newSocket, setNewSocket] = useState<any>();
  const [conversationId, setConversationId] = useState<string | null>(
    sessionStorage.getItem('conversationId')
  );
  const [isMobileAvailable, setIsMobileAvailable] = useState(
    localStorage.getItem('phoneNumber') ? true : false || false
  );
  const timer1 = flagsmith.getValue('timer1', { fallback: 5000 });
  const timer2 = flagsmith.getValue('timer2', { fallback: 25000 });
  const [isDown, setIsDown] = useState(true);
  const [showDialerPopup, setShowDialerPopup] = useState(false);
  const [isConnected, setIsConnected] = useState(newSocket?.connected || false);
  console.log(messages);

  useEffect(() => {
    if (
      (localStorage.getItem('phoneNumber') && localStorage.getItem('auth')) ||
      isMobileAvailable
    ) {
      setNewSocket(
        io(URL, {
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
        })
      );
    }
  }, [isMobileAvailable]);

  const updateMsgState = useCallback(
    ({
      user,
      msg,
      media,
    }: {
      user: { name: string; id: string };
      msg: { content: { title: string; choices: any }; messageId: string };
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
          //@ts-ignore
          conversationId: msg?.content?.conversationId,
          sentTimestamp: Date.now(),
          ...media,
        };

        //@ts-ignore
        if (conversationId === msg?.content?.conversationId)
          setMessages((prev: any) => _.uniq([...prev, newMsg], ['messageId']));
      }
    },
    [conversationId]
  );

  const onMessageReceived = useCallback(
    (msg: any): void => {
      console.log('mssgs:', messages);
      console.log('#-debug:', { msg });
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
        updateMsgState({ user, msg, media: {} });
      }
    },
    [messages, updateMsgState]
  );

  //@ts-ignore
  const onSocketConnect = useCallback(
    ({ text }: { text: string }): void => {
      setIsConnected(false);
      setTimeout(() => {
        newSocket?.connect();
        setIsConnected(true);
      }, 30);

      setTimeout(() => {
        if (newSocket?.connected) sendMessage(text, null);
      }, 40);
      //@ts-ignore
    },
    [newSocket, sendMessage]
  );

  useEffect(() => {
    if (
      (!isConnected && newSocket && !newSocket.connected) ||
      (newSocket && !newSocket.connected)
    ) {
      newSocket.connect();
      setIsConnected(true);
    }
  }, [isConnected, newSocket]);

  useEffect(() => {
    function onConnect(): void {
      setIsConnected(true);
    }

    function onDisconnect(): void {
      setIsConnected(false);
    }

    function onSessionCreated(sessionArg: { session: any }) {
      setSocketSession(sessionArg);
    }

    function onException(exception: any) {
      toast.error(exception?.message);
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: exception?.message,
      });
    }

    if (newSocket) {
      newSocket.on('connect', onConnect);
      newSocket.on('disconnect', onDisconnect);
      newSocket.on('botResponse', onMessageReceived);

      newSocket.on('exception', onException);
      newSocket.on('session', onSessionCreated);
    }

    return () => {
      if (newSocket) {
        newSocket.off('disconnect', onDisconnect);
      }
    };
  }, [isConnected, newSocket, onMessageReceived]);

  const onChangeCurrentUser = useCallback((newUser: UserType) => {
    setCurrentUser({ ...newUser, active: true });
    // setMessages([]);
  }, []);
  console.log('vbnmm:', { newSocket });

  //@ts-ignore
  const sendMessage = useCallback(
    (text: string, media: any, isVisibile = true): void => {
      // console.log('mssgs:', messages)
      setLoading(true);
      setIsMsgReceiving(true);

      if (!newSocket?.connected || !socketSession) {
        toast(
          (to) => (
            <span>
              <Button
                onClick={() => {
                  onSocketConnect({ text });
                  toast.dismiss(to.id);
                }}>
                {t('label.click')}
              </Button>
              {t('message.socket_disconnect_msg')}
            </span>
          ),
          {
            icon: '',
            duration: 10000,
          }
        );
        return;
      }
      //  console.log('mssgs:',messages)
      send({ text, socketSession, socket: newSocket, conversationId });
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
          //    console.log('mssgs:',messages)
        }
    },
    [newSocket, socketSession, conversationId, t, onSocketConnect, currentUser?.id]
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
      } catch (error) {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      }
    }, [setIsDown, flags]);

  useEffect(() => {
    if (!socketSession && newSocket) {
      console.log('vbn:', { socketSession, newSocket });
    }
  }, [newSocket, socketSession]);

  console.log('vbn: aa', {
    socketSession,
    newSocket,
    isConnected,
    isMobileAvailable,
  });

  useEffect(() => {
    if (isDown) return;
    let secondTimer: any;
    const timer = setTimeout(() => {
      if (isMsgReceiving && loading) {
        toast.error(`${t('message.taking_longer')}`);
        secondTimer = setTimeout(() => {
          if (isMsgReceiving && loading) {
            toast.error(`${t('message.retry')}`);
            setIsMsgReceiving(false);
            setLoading(false);
          }
        }, timer2);
      }
    }, timer1);

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [isDown, isMsgReceiving, loading, t, timer1, timer2]);

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
      socketSession,
      isMsgReceiving,
      setIsMsgReceiving,
      locale,
      setLocale,
      localeMsgs,
      isMobileAvailable,
      setIsMobileAvailable,
      setConversationId,
      onSocketConnect,
      newSocket,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup
    }),
    [
      locale,
      isMobileAvailable,
      setIsMobileAvailable,
      setLocale,
      localeMsgs,
      currentUser,
      socketSession,
      users,
      onChangeCurrentUser,
      sendMessage,
      messages,
      loading,
      setLoading,
      isMsgReceiving,
      setIsMsgReceiving,
      setConversationId,
      onSocketConnect,
      newSocket,
      isDown,
      fetchIsDown,
      showDialerPopup,
      setShowDialerPopup
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