import axios from 'axios';
//@ts-ignore
import Chat from 'chatui';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { AppContext } from '../../../context';
import { useLocalization } from '../../../hooks';
import { getMsgType } from '../../../utils/getMsgType';
import ChatMessageItem from '../../chat-message-item';
import { v4 as uuidv4 } from 'uuid';
import DownTimePage from '../../down-time-page';

const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);  

  useEffect(() => {
    const fetchData = async () => {
      try {
        await context?.fetchIsDown();
        if(!context?.isDown){
          
          const chatHistory = await axios.get(
            `${
              process.env.NEXT_PUBLIC_BASE_URL
            }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem('auth')}`,
              },
            }
          );
          console.log("ghji:",chatHistory)
          console.log('history:', chatHistory.data);
          const normalizedChats = normalizedChat(chatHistory.data);
          if (normalizedChats.length > 0) {
            context?.setMessages(normalizedChats);
          }
        }
      } catch (error:any) {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      }
    };
    !context?.loading && fetchData();
   
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.setMessages, context?.fetchIsDown,context?.loading,context?.isDown]);

  const normalizedChat = (chats: any): any => {
    console.log('in normalized');
    const conversationId = sessionStorage.getItem('conversationId');
    const history = chats
      .filter(
        (item: any) =>
          conversationId === 'null' || item.conversationId === conversationId
      )
      .flatMap((item: any) => [
        {
          text: item.query,
          position: 'right',
          repliedTimestamp: item.createdAt,
          messageId: uuidv4(),
        },
        {
          text: item.response,
          position: 'left',
          sentTimestamp: item.createdAt,
          reaction: item.reaction,
          msgId: item.id,
          messageId: item.id,
        },
      ]);

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

  const handleSend = useCallback(
    (type: string, val: any) => {
      console.log('mssgs:', context?.messages);
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
  if (context?.isDown) {
    return <DownTimePage />;
  } else
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