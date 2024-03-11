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
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import { getMsgType } from '../../utils/getMsgType';
import ChatMessageItem from '../chat-message-item';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import toast from 'react-hot-toast';
import DownTimePage from '../down-time-page';
import shareIcon from '../../assets/icons/share.svg';
import downloadIcon from '../../assets/icons/download.svg';
import Image from 'next/image';
import Loader from '../loader';
import Draggable from 'react-draggable'
import { recordUserLocation } from '../../utils/location';
import router from 'next/router';

const ChatUiWindow: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [shareLoader, setShareLoader] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await context?.fetchIsDown();
        if (!context?.isDown) {
          const chatHistory = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL
            }/user/chathistory/${sessionStorage.getItem('conversationId')}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem('auth')}`,
              },
            }
          );

          console.log('ghji:', chatHistory);
          console.log('history:', chatHistory.data);

          const modifiedChatHistory = chatHistory.data.map((chat: any) => {
            if (!chat.response) {
              chat.response =
                t('message.no_signal');
            }
            return chat;
          });

          const normalizedChats = normalizedChat(modifiedChatHistory);
          console.log('normalized chats', normalizedChats);
          if (normalizedChats.length > 0) {
            context?.setMessages(normalizedChats);
          }
        }
      } catch (error: any) {
        //@ts-ignore
        logEvent(analytics, 'console_error', {
          error_message: error.message,
        });
      }
    };
    recordUserLocation();
    !context?.loading && fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.setMessages, context?.fetchIsDown, context?.isDown]);

  const normalizedChat = (chats: any): any => {
    console.log('in normalized', chats);
    const conversationId = sessionStorage.getItem('conversationId');
    const history = chats
      .filter(
        (item: any) =>
          conversationId === 'null' || item.conversationId === conversationId
      )
      .flatMap((item: any) =>
        [
          item.query?.length && {
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
            audio_url: item.audioURL,
            isEnd: true,
            optionClicked: true
          },
        ].filter(Boolean)
      );

    console.log('historyyy', history);
    console.log('history length:', history.length);

    return history;
  };

  const handleSend = useCallback(
    async (type: string, msg: any) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      console.log('mssgs:', context?.messages);
      if (type === 'text' && msg.trim()) {
        context?.sendMessage(msg.trim());
      }
    },
    [context, t]
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
  console.log('fghj:', { messages: context?.messages });
  const msgToRender = useMemo(() => {
    return context?.loading
      ? [
        ...normalizeMsgs,
        {
          type: 'loader',
          position: 'left',
          botUuid: '1',
        },
      ]
      : normalizeMsgs;
  }, [context?.loading, normalizeMsgs]);

  console.log('debug:', { msgToRender });

  const placeholder = useMemo(() => context?.kaliaClicked ? t('message.return_to_home_screen') : t('message.ask_ur_question'), [t]);

  const downloadShareHandler = async (type: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL
        }/user/chathistory/generate-pdf/${sessionStorage.getItem(
          'conversationId'
        )}`;
      if (type === 'download') {
        setDownloadLoader(true);
      } else setShareLoader(true);
      const response = await axios.post(url, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      });
      const pdfUrl = response.data.pdfUrl;

      if (!pdfUrl) {
        toast.error(`${t('message.no_link')}`);
        return;
      }

      if (type === 'download') {
        setDownloadLoader(false);
        //@ts-ignore
        logEvent(analytics, 'download_chat_clicked');
        toast.success(`${t('message.downloading')}`);
        const link = document.createElement('a');

        link.href = pdfUrl;
        link.target = '_blank';
        // link.href = window.URL.createObjectURL(blob);

        link.download = 'Chat.pdf';
        link.click();
        setDownloadLoader(false);

        context?.downloadChat(pdfUrl);
      } else if (type === 'share') {
        setShareLoader(false);
        const response = await axios.get(pdfUrl, {
          responseType: 'arraybuffer',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const file = new File([blob], 'Chat.pdf', { type: blob.type });

        //@ts-ignore
        logEvent(analytics, 'share_chat_clicked');
        setShareLoader(false);

        if (!navigator.canShare) {
          //@ts-ignore
          if (window?.AndroidHandler?.shareUrl) {
            //@ts-ignore
            window.AndroidHandler.shareUrl(pdfUrl);
          } else {
            context?.shareChat(pdfUrl);
          }
        } else if (navigator.canShare({ files: [file] })) {
          toast.success(`${t('message.sharing')}`);
          console.log("hurray", file)
          await navigator
            .share({
              files: [file],
              title: 'Chat',
              text: 'Check out my chat with AmaKrushAI!',
            })
            .catch((error) => {
              toast.error(error.message);
              console.error('Error sharing', error);
            });
        } else {
          toast.error(`${t('message.cannot_share')}`);
          console.error("Your system doesn't support sharing this file.");
        }
      } else {
        console.log(response.data);
        setDownloadLoader(false);
        setShareLoader(false);
      }
    } catch (error: any) {
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: error.message,
      });
      setDownloadLoader(false);
      setShareLoader(false);
      if (
        error.message ===
        "Cannot read properties of undefined (reading 'shareUrl')"
      ) {
        toast.success(`${t('message.shareUrl_android_error')}`);
      } else toast.error(error.message);

      console.error(error);
    }
  };

  const handleInputFocus = () => {
    if (context?.kaliaClicked) {
      context?.setKaliaClicked(false);
      router.push('/');
    }
  }

  if (context?.isDown) {
    return <DownTimePage />;
  } else
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Chat
          btnColor="var(--secondarygreen)"
          background="var(--bg-color)"
          disableSend={context?.isMsgReceiving}
          translation={t}
          showTransliteration={!(localStorage.getItem('locale') === 'en')}
          //@ts-ignore
          messages={msgToRender}
          voiceToText={RenderVoiceRecorder}
          //@ts-ignore
          renderMessageContent={(props): ReactElement => (
            <ChatMessageItem
              key={props}
              message={props}
              onSend={handleSend}
            />
          )}
          onInputFocus={handleInputFocus}
          onSend={handleSend}
          locale="en-US"
          placeholder={placeholder}
        />
        <Draggable axis="y">
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '40%',
              background: 'white',
              padding: '5px',
              borderRadius: '5px 0 0 5px',
              boxShadow: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px'
            }}>
            <div onClick={() => downloadShareHandler('share')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Share */}
              {shareLoader ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                  }}>
                  <Loader />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image src={shareIcon} alt="" width={22} height={22} />{' '}
                </div>
              )}
              <p style={{ fontSize: '10px', margin: 0, color: 'var(--font)', fontFamily: 'Mulish-bold' }}>
                {t('label.share')}
              </p>
            </div>
            <div
              style={{
                borderBottom: '1px solid var(--font)',
                margin: '5px 0',
              }}></div>
            <div onClick={() => downloadShareHandler('download')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Download */}
              {downloadLoader ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '24px',
                    height: '24px',
                  }}>
                  <Loader />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image src={downloadIcon} alt="" width={24} height={24} />
                </div>
              )}
              <p style={{ fontSize: '10px', margin: 0, color: 'var(--font)', fontFamily: 'Mulish-bold' }}>
                {t('label.download')}
              </p>
            </div>
            {/* <div onClick={() => downloadShareHandler('share')}>
       
              <Image src={shareIcon} alt="" width={24} height={24} />
            </div>
            <div
              style={{
                borderBottom: '1px solid var(--secondarygreen)',
                margin: '5px 0',
              }}></div>
            <div onClick={() => downloadShareHandler('download')}>
              
              <Image src={downloadIcon} alt="" width={24} height={24} />
            </div> */}
          </div>
        </Draggable>
      </div>
    );
};

export default ChatUiWindow;
