import axios from 'axios';
//@ts-ignore
import Chat from 'chatui';
import { useRouter } from 'next/router';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCookies } from 'react-cookie';

import { AppContext } from '../../../context';
import { useLocalization } from '../../../hooks';
import { getMsgType } from '../../../utils/getMsgType';
import ChatMessageItem from '../../chat-message-item';

const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [cookies, setCookies] = useCookies();

  const [chatHistory, setChatHistory] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/user/chathistory/${localStorage.getItem(
          'userID'
        )}/${localStorage.getItem('conversationId')}`
      );
      console.log('history:',  res.data );
      const newHistory = res.data
        .filter(
          (item) =>
          localStorage.getItem('conversationId') === 'null' ||
          item.conversationId === localStorage.getItem('conversationId')
        )
        .flatMap((item) => [
          {
            text: item.query,
            position: 'right',
            repliedTimestamp: item.createdAt,
          },
          {
            text: item.response,
            position: 'left',
            sentTimestamp: item.createdAt,
            reaction: item.reaction
          },
        ]);
      setChatHistory(newHistory);
    } catch (error) {
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: error.message,
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (chatHistory.length > 0) context?.setMessages(chatHistory);
  }, [chatHistory, context]);

  useEffect(() => {
    if (cookies['access_token'] !== undefined) {
      axios
        .get(`/api/auth?token=${cookies['access_token']}`)
        .then((response) => {
          if (response.data === null) {
            throw 'Invalid Access Token';
            // // router.push("/login");
          }
        })
        .catch((err) => {
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: err.message,
          });
          throw err;
        });
      setAccessToken(cookies['access_token']);
    } else {
      router.push('/login');
    }
  }, [cookies, router]);

  const handleSend = useCallback(
    (type: string, val: any) => {
      if (type === 'text' && val.trim()) {
        context?.sendMessage(val.trim());
      }
    },
    [context]
  );
  const normalizeMsgs = useMemo(
    () =>
      context?.messages?.map((msg: any) => ({
        type: getMsgType(msg),
        content: { text: msg?.text, data: { ...msg } },
        position: msg?.position ?? 'right',
      })),
    [context?.messages]
  );

  const msgToRender = useMemo(() => {
    return context?.isMsgReceiving
      ? [
          ...normalizeMsgs,
          {
            type: 'loader',
            position: 'left',
            botUuid: '1',
          },
        ]
      : normalizeMsgs;
  }, [context?.isMsgReceiving, normalizeMsgs]);

  console.log('debug:', { msgToRender });

  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Chat
        btnColor="var(--secondarygreen)"
        background="var(--bg-color)"
        disableSend={context?.loading}
        //@ts-ignore
        messages={msgToRender}
        //@ts-ignore
        renderMessageContent={(props): ReactElement => (
          <ChatMessageItem
            key={props}
            message={props}
            currentUser={context?.currentUser}
            onSend={handleSend}
          />
        )}
        onSend={handleSend}
        locale="en-US"
        placeholder={placeholder}
      />
    </div>
  );
};

export default ChatUiWindow;
