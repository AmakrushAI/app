import {
  Bubble,
  Image as Img,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Video,
  Typing,
  //@ts-ignore
} from 'chatui';
import axios from 'axios';
import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

import styles from './index.module.css';
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import RightIcon from '../../assets/icons/right.jsx';
import MsgThumbsUp from '../../assets/icons/msg-thumbs-up.jsx';
import MsgThumbsDown from '../../assets/icons/msg-thumbs-down.jsx';
import { AppContext } from '../../context';
import { ChatMessageItemPropType } from '../../types';
import { getFormatedTime } from '../../utils/getUtcTime';
import { useLocalization } from '../../hooks/useLocalization';
import { getReactionUrl } from '../../utils/getUrls';
import { useFlags } from 'flagsmith/react';

const getToastMessage = (t: any, reaction: number): string => {
  if (reaction === 1) return t('toast.reaction_like');
  return t('toast.reaction_reset');
};
const ChatMessageItem: FC<ChatMessageItemPropType> = ({
  currentUser,
  message,
  onSend,
}) => {
  const flags = useFlags(['dialer_number']);
  const t = useLocalization();
  const context = useContext(AppContext);
  const [reaction, setReaction] = useState(message?.content?.data?.reaction);


  useEffect(() => {
    setReaction(message?.content?.data?.reaction);
  }, [message?.content?.data?.reaction]);

  const onLikeDislike = useCallback(
    ({ value, msgId }: { value: 0 | 1 | -1; msgId: string }) => {
      let url = getReactionUrl({ msgId, reaction: value });

      axios
        .get(url, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('auth')}`,
          },
        })
        .then((res: any) => {
          if (value === -1) {
            context?.setShowDialerPopup(true);
          } else {
            toast.success(`${getToastMessage(t, value)}`);
          }
        })
        .catch((error: any) => {
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: error.message,
          });
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const feedbackHandler = useCallback(
    ({ like, msgId }: { like: 0 | 1 | -1; msgId: string }) => {
      console.log('vbnm:', { reaction, like });
      if (reaction === 0) {
        setReaction(like);
        return onLikeDislike({ value: like, msgId });
      }
      if (reaction === 1 && like === -1) {
        console.log('vbnm triggered 1');
        setReaction(-1);
        return onLikeDislike({ value: -1, msgId });
      }
      if (reaction === -1 && like === 1) {
        console.log('vbnm triggered 2');
        setReaction(1);
        return onLikeDislike({ value: 1, msgId });
      }

      console.log('vbnm triggered');
      onLikeDislike({ value: 0, msgId });
      setReaction(0);
    },
    [onLikeDislike, reaction]
  );

  const getLists = useCallback(
    ({ choices, isDisabled }: { choices: any; isDisabled: boolean }) => {
      console.log('qwer12:', { choices, isDisabled });
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              onClick={(e: any): void => {
                e.preventDefault();
                console.log('qwer12 trig', { key: choice.key, isDisabled });
                if (isDisabled) {
                  toast.error(`${t('message.cannot_answer_again')}`);
                } else {
                  if (context?.messages?.[0]?.exampleOptions) {
                    console.log('clearing chat');
                    context?.setMessages([]);
                  }
                  context?.sendMessage(choice.text);
                }
              }}>
              <div className="onHover" style={{ display: 'flex' }}>
                <div>{choice.text}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <RightIcon width="5.5vh" color="var(--secondarygreen)" />
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    },
    [context, t]
  );

  const { content, type } = message;

  switch (type) {
    case 'loader':
      return <Typing />;
    case 'text':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}>
          <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }></div>
          <Bubble type="text">
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right' ? 'white' : 'var(--font)',
              }}>
              {content.text}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
              <span
                style={{
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : 'var(--font)',
                  fontSize: '10px',
                }}>
                {getFormatedTime(
                  content?.data?.sentTimestamp ||
                    content?.data?.repliedTimestamp
                )}
              </span>
            </div>
          </Bubble>
          {content?.data?.position === 'left' && (
            <div className={styles.msgFeedback}>
              <div className={styles.msgFeedbackIcons}>
                <div
                  onClick={() =>
                    feedbackHandler({
                      like: 1,
                      msgId: content?.data?.messageId,
                    })
                  }>
                  <MsgThumbsUp
                    fill={reaction === 1}
                    width="20px"
                    color="var(--secondarygreen)"
                  />
                </div>
                <div
                  onClick={() =>
                    feedbackHandler({
                      like: -1,
                      msgId: content?.data?.messageId,
                    })
                  }>
                  <MsgThumbsDown
                    fill={reaction === -1}
                    width="20px"
                    color="var(--secondarygreen)"
                  />
                </div>
              </div>
              &nbsp;
              <p>{t('message.helpful')}</p>
            </div>
          )}
        </div>
      );

    case 'image': {
      const url = content?.data?.payload?.media?.url || content?.data?.imageUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Img src={url} width="299" height="200" alt="image" lazy fluid />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'file': {
      const url = content?.data?.payload?.media?.url || content?.data?.fileUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <FileCard file={url} extension="pdf" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }

    case 'video': {
      const url = content?.data?.payload?.media?.url || content?.data?.videoUrl;
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Video
                cover="https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/video-icon.png"
                src={url}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}>
                <span style={{ color: 'var(--font)', fontSize: '10px' }}>
                  {getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      );
    }
    case 'options': {
      console.log('qwe12:', { content });
      return (
        <>
          {/* <div
            style={{ width: "95px", marginRight: "4px", textAlign: "center" }}
          ></div> */}
          <Bubble type="text" className={styles.textBubble}>
            <div style={{ display: 'flex' }}>
              <span className={styles.optionsText}>
                {content?.data?.payload?.text}
              </span>
            </div>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
              isDisabled: false,
            })}
          </Bubble>
        </>
      );
    }
    default:
      return (
        <ScrollView
          data={[]}
          // @ts-ignore
          renderItem={(item): ReactElement => <Button label={item.text} />}
        />
      );
  }
};

export default ChatMessageItem;