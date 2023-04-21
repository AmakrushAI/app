import {
  Bubble,
  Image as Img,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Video,
  //@ts-ignore
} from "chatui";

import React, { FC, ReactElement, useCallback, useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-hot-toast";

import styles from "./index.module.css";

import { Spinner } from "@chakra-ui/react";
import RightIcon from '../../assets/icons/right.jsx';
import MsgThumbsUp from '../../assets/icons/msg-thumbs-up.jsx';
import MsgThumbsDown from '../../assets/icons/msg-thumbs-down.jsx';
import { AppContext } from "../../context";
import { ChatMessageItemPropType } from "../../types";
import { getFormatedTime } from "../../utils/getUtcTime";

const ChatMessageItem: FC<ChatMessageItemPropType> = ({
  currentUser,
  message,
  onSend,
}) => {
  const context = useContext(AppContext);
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);

  const feedbackHandler = useCallback(
    (name: string) => {
      console.log(thumbsUp);
      if (name === 'up') {
        setThumbsUp(!thumbsUp);
        if (thumbsDown) setThumbsDown(false);
      } else {
        setThumbsDown(!thumbsDown);
        if (thumbsUp) setThumbsUp(false);
      }
    },
    [thumbsDown, thumbsUp]
  );

  const getLists = useCallback(
    ({ choices, isDisabled }: { choices: any; isDisabled: boolean }) => {
      console.log("qwer12:", { choices, isDisabled });
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              onClick={(e: any): void => {
                e.preventDefault();
                console.log("qwer12 trig", { key: choice.key, isDisabled });
                if (isDisabled) {
                  toast.error("Cannot answer again");
                } else {
                  if (context?.messages?.[0]?.exampleOptions) {
                    context?.setMessages([]);
                  }
                  context?.sendMessage(choice.text);
                }
              }}>
              <div className="onHover" style={{ display: 'flex' }}>
                <div>{choice.text}</div>
                <div style={{marginLeft: 'auto'}}><RightIcon width="5.5vh" color="var(--secondarygreen)" /></div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    },
    [context]
  );

  const { content, type } = message;

  switch (type) {
    case "loader":
      return <Spinner />;
    case "text":
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Bubble type="text">
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                color:
                  content?.data?.position === "right" ? "white" : "var(--font)",
              }}
            >
              {content.text}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent:
                  content?.data?.position === 'left' ? 'flex-end' : '',
              }}>
              <span
                style={{
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : 'var(--font)',
                  fontSize: '10px',
                }}>
                {
                  getFormatedTime(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )
                }
              </span>
            </div>
          </Bubble>
          {content?.data?.position === 'left' && (
            <div className={styles.msgFeedback}>
              <div className={styles.msgFeedbackIcons}>
                <div onClick={() => feedbackHandler('up')}>
                  <MsgThumbsUp
                    fill={thumbsUp}
                    width="20px"
                    color="var(--secondarygreen)"
                  />
                </div>
                <div onClick={() => feedbackHandler('down')}>
                  <MsgThumbsDown
                    onClick={() => feedbackHandler('down')}
                    fill={thumbsDown}
                    width="20px"
                    color="var(--secondarygreen)"
                  />
                </div>
              </div>
              &nbsp;
              <p>was this helpful?</p>
            </div>
          )}
        </div>
      );

    case "image": {
      const url = content?.data?.payload?.media?.url || content?.data?.imageUrl;
      return (
        <>
          {content?.data?.position === "left" && (
            <div
              style={{
                width: "40px",
                marginRight: "4px",
                textAlign: "center",
              }}
            ></div>
          )}
          <Bubble type="image">

            <div style={{ padding: '7px' }}>
              <Img src={url} width="299" height="200" alt="image" lazy fluid />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "self-end",
                }}
              >
                <span style={{ color: "var(--font)", fontSize: "10px" }}>
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

    case "file": {
      const url = content?.data?.payload?.media?.url || content?.data?.fileUrl;
      return (
        <>
          {content?.data?.position === "left" && (
            <div
              style={{
                width: "40px",
                marginRight: "4px",
                textAlign: "center",
              }}
            ></div>
          )}
          <Bubble type="image">
            <div style={{ padding: "7px" }}>
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

    case "video": {
      const url = content?.data?.payload?.media?.url || content?.data?.videoUrl;
      return (
        <>
          {content?.data?.position === "left" && (
            <div
              style={{
                width: "40px",
                marginRight: "4px",
                textAlign: "center",
              }}
            ></div>
          )}
          <Bubble type="image">
            <div style={{ padding: "7px" }}>
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
    case "options": {
      console.log("qwe12:", { content });
      return (
        <>
          {/* <div
            style={{ width: "95px", marginRight: "4px", textAlign: "center" }}
          ></div> */}
          <Bubble type="text" className={styles.textBubble}>
            <div style={{ display: "flex" }}>
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
