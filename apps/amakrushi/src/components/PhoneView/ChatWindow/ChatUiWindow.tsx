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
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { AppContext } from '../../../context';
import { useLocalization } from '../../../hooks';
import { getMsgType } from '../../../utils/getMsgType';
import ChatMessageItem from '../../chat-message-item';
import { v4 as uuidv4 } from 'uuid';
const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [cookies, setCookies] = useCookies();

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL
        }/user/chathistory/${localStorage.getItem(
          'userID'
        )}/${localStorage.getItem('conversationId')}`
      )
      .then((res) => {
        console.log('history:', res.data);
        const normalizedChats = normalizedChat(res.data);
        if(normalizedChats.length>0) context?.setMessages(normalizedChats);
      })
      .catch((error) => {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      });
      
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.setMessages]);

  const normalizedChat = (chats: any): any => {
    console.log('in normalized');
    const conversationId = localStorage.getItem('conversationId');
    console.log("chakshu:",{chats,conversationId})
    const history = chats.filter((item:any) =>
        conversationId === 'null' || item.conversationId === conversationId
      ).flatMap((item:any) => [
        {
          text: item.query,
          position: 'right',
          repliedTimestamp: item.createdAt,
          messageId: uuidv4()
        },
        {
          text: item.response,
          position: 'left',
          sentTimestamp: item.createdAt,
          reaction: item.reaction,
          msgId: item.id,
          messageId: item.id
        },
      ]);

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

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
      console.log('mssgs:', context?.messages)
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
