import {
  Bubble,
  Image,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Video,
  //@ts-ignore
} from "chatui";

import { map } from "lodash";
import moment from "moment";
import React, { FC, ReactElement, useCallback, useContext } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-hot-toast";

import styles from "./index.module.css";

import { Spinner } from "@chakra-ui/react";
import { AppContext } from "../../context";
import { ChatMessageItemPropType } from "../../types";

const ChatMessageItem: FC<ChatMessageItemPropType> = ({
  currentUser,
  message,
  onSend,
}) => {
  const context = useContext(AppContext);

  const handleSend = useCallback(
    (type: string, val: any) => {
      if (type === "text" && val.trim()) {
        onSend(val, null, true, currentUser);
      }
    },
    [onSend, currentUser]
  );

  const getLists = useCallback(
    ({ choices, isDisabled }: { choices: any; isDisabled: boolean }) => {
      return (
        <List className={`${styles.list}`}>
          {map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              onClick={(e: any): void => {
                e.preventDefault();
                console.log("qwer12 trig", { key: choice.key, isDisabled });
                if (isDisabled) {
                  toast.error("Cannot answer again");
                } else {
                  handleSend("text", choice.key);
                }
              }}
            >
              {" "}
              <div>
                <span className="onHover">
                  {choice.key} {choice.text}
                </span>
              </div>{" "}
            </ListItem>
          ))}
        </List>
      );
    },
    [handleSend]
  );

  const { content, type } = message;

  switch (type) {
    case "loader":
      return <Spinner />;
    case "text":
      return (
        <>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "self-end",
              }}
            >
              <span
                style={{
                  color:
                    content?.data?.position === "right"
                      ? "white"
                      : "var(--grey)",
                  fontSize: "10px",
                }}
              >
                {moment
                  .utc(
                    content?.data?.sentTimestamp ||
                      content?.data?.repliedTimestamp
                  )
                  .local()
                  .format("DD/MM/YYYY : hh:mm")}
              </span>
            </div>
          </Bubble>
          {content?.data?.position === "right" && context?.loading && (
            <div
              style={{
                marginRight: "auto",
                display: "flex",
                position: "absolute",
                bottom: 0,
                left: 0,
              }}
            ></div>
          )}
        </>
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
            <div style={{ padding: "7px" }}>
              <Image
                src={url}
                width="299"
                height="200"
                alt="image"
                lazy
                fluid
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "self-end",
                }}
              >
                <span style={{ color: "var(--grey)", fontSize: "10px" }}>
                  {moment
                    .utc(
                      content?.data?.sentTimestamp ||
                        content?.data?.repliedTimestamp
                    )
                    .local()
                    .format("DD/MM/YYYY : hh:mm")}
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "self-end",
                }}
              >
                <span style={{ color: "var(--grey)", fontSize: "10px" }}>
                  {moment
                    .utc(
                      content?.data?.sentTimestamp ||
                        content?.data?.repliedTimestamp
                    )
                    .local()
                    .format("DD/MM/YYYY : hh:mm")}
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
                cover="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAADMCAMAAACY78UPAAAAeFBMVEUyMjL///8vLy/Q0NBJSUlAQEA8Oz85OD0tLS0qKio1Nzs5OTz6+vo5OTnZ2dkzMzPw8PBkZGRGRkaAgIDo6OioqKgkJCR6enqurq5SUlLMzMyFhYXh4eHW1ta7u7tHR0dcXFybm5twcHC/v7+UlJRXWFeVlZVsbGwZSzceAAAD0UlEQVR4nO3ca3OiMBiGYYOoPUQNihVBrQfc/v9/uEntslRBwmFk3jfPNbOf2tlyT0oCgTp4m0wm75Mb46tRkfH40Vf/f7nczQ97L/aW0d8xLfxJ1+N+n4wnFcejvzH//+l/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgOfw+j6AfswXcxfLvcUqnb70fRTP5/lDebx8ODfkuluI3Xrg2pB/dwu137y4NeTXbjPkI6eG/F+3CKPPj74P5omybiGGiefO73quW6jo8Nr38TxLvlvI3dJz5Cz/1a2H/Oi7sZbfdAsxWzpx+XbXrSd2F9by+24h4yX/ib2g20zs01fm5YXdQsQJ87O8pFuo1YH15VtZt17LT6+Mh7y02ww544n9Qbdey08jruEPu8U2+mK6pD3uFnK2HLC8V6no1uX7A8et5spuIXapz2/ILbr15duG3Vlu0y3kMJkzG3KrbnOWB7zOcstuPbEnrNZy225zXx4w2oqx79aXb4z22Ot0C7UPuDw8rdWtJ/Z0xGNir9fN5yatbrc+y9Mpg/D63fryjcFZ3qBbyF1CfmJv0m3WcuqPVZp165u0ZEF6yJt267Wc9H15425zkzalu5Y37zZr+YXsWt6mW4htQnUtb9ctwlVAcyumZbdey9dzihN7225z+XYhOOTtu82LUAtyE3sX3WbDldpa3km3eUWC2GOVbrq/330jdZZ31W2epC3mfdfY66xbX8Ss3ezebwj9onfWHdPaZO6oOzwHtN786qY7PC36Dqmpi24VnWgN9qCLbrlNPFrXLEbrbhldKN6Dt+0eHmm+BNKuW54X5M7sq1bdwyXNwR606g7PJ7Lbii26VTLt++BbaNqtjgHdwR407ZbbP4SfGRjNuvcHimt2XpPuYeqT/h036nereEP8GbBRu3u2pLS9UKpmtzqfSG0flqrXHSb032y5qtMtjwH1aTxj3y1nK+Jrdp5995n8mp1n222e/THKtuxWMad3sA2r7nDp932cXbPoVvs1+cvSO9V/PxamBLdLK1V1y4jPmp1X0b1b+aym8czj7pjfH8z9eNS9S8hul1Yq71aUt0srlXarZETo9YXaSrpVxOQ+u0xhtwyPjG69ChV273mu2XkF3bPjhueanXfXLYfU/2TGym33LNlQei2psd/dKl478oF7v7pVSvkRZy25brn6Yj+NZ7JuuY24r9l5Wfc5YPX5DVV+umepA2t23ne3ir9cWLPzTHeYbPo+jKfz/HPszIfk5nifJ24fQWRn6s6aDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbPwFoto0lZUp3cEAAAAASUVORK5CYII="
                src={url}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "self-end",
                }}
              >
                <span style={{ color: "var(--grey)", fontSize: "10px" }}>
                  {moment
                    .utc(
                      content?.data?.sentTimestamp ||
                        content?.data?.repliedTimestamp
                    )
                    .local()
                    .format("DD/MM/YYYY : hh:mm")}
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
          <div
            style={{ width: "95px", marginRight: "4px", textAlign: "center" }}
          ></div>
          <Bubble type="text">
            <div style={{ display: "flex" }}>
              <span style={{ fontSize: "16px" }}>{content.text}</span>
            </div>
            <div style={{ marginTop: "10px" }} />
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
              isDisabled: content?.data?.disabled,
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
