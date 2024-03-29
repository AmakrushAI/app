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

import { toast } from 'react-hot-toast';
import { oriaWeatherTranslates } from '../../utils/getWeatherTranslation';
import styles from './index.module.css';
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import RightIcon from '../../assets/icons/right.jsx';
import SpeakerIcon from '../../assets/icons/speaker.svg';
import SpeakerPauseIcon from '../../assets/icons/speakerPause.svg';
import MsgThumbsUp from '../../assets/icons/msg-thumbs-up.jsx';
import MsgThumbsDown from '../../assets/icons/msg-thumbs-down.jsx';
import { AppContext } from '../../context';
import { ChatMessageItemPropType } from '../../types';
import { getFormatedTime } from '../../utils/getUtcTime';
import { useLocalization } from '../../hooks/useLocalization';
import { getReactionUrl } from '../../utils/getUrls';
import { useFlags } from 'flagsmith/react';
import Image from 'next/image';
import { Button } from '@chakra-ui/react';
import flagsmith from 'flagsmith/isomorphic';
import Loader from '../loader';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { useIntl } from 'react-intl';
import BlinkingSpinner from '../blinking-spinner/index';

interface FormattedTextProps {
  content: string;
}

const getToastMessage = (t: any, reaction: number): string => {
  if (reaction === 1) return t('toast.reaction_like');
  return t('toast.reaction_reset');
};
const ChatMessageItem: FC<ChatMessageItemPropType> = ({ message, onSend }) => {
  const flags = useFlags(['show_msg_id', 'dialer_number']);
  const intl = useIntl();
  const t = useLocalization();
  const context = useContext(AppContext);
  const [reaction, setReaction] = useState(message?.content?.data?.reaction);
  const [audioFetched, setAudioFetched] = useState(false);
  const [ttsLoader, setTtsLoader] = useState(false);

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
            context?.setCurrentQuery(msgId);
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

  async function copyTextToClipboard(text: string) {
    console.log('here');
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }
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
  const [optionDisabled, setOptionDisabled] = useState(
    message?.content?.data?.optionClicked || false
  );
  const getLists = useCallback(
    ({ choices, isWeather = false }: { choices: any; isWeather: Boolean }) => {
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              style={
                optionDisabled
                  ? {
                    background: 'var(--lightgrey)',
                    color: 'var(--font)',
                    boxShadow: 'none',
                  }
                  : null
              }
              onClick={(e: any): void => {
                e.preventDefault();
                console.log("Option Disabled", optionDisabled)
                if (optionDisabled) {
                  toast.error(
                    `${isWeather
                      ? t('message.wait_before_choosing')
                      : t('message.cannot_answer_again')
                    }`
                  );
                } else {
                  if (context?.messages?.[0]?.exampleOptions) {
                    console.log('clearing chat');
                    context?.setMessages([]);
                  }
                  if (isWeather)
                    context?.sendMessage(choice?.text, false, true, choice);
                  else context?.sendMessage(choice);
                  setOptionDisabled(true);
                  if (isWeather)
                    setTimeout(
                      () =>
                        document
                          .getElementsByClassName('PullToRefresh')?.[0]
                          ?.scrollTo({
                            top: 999999,
                            left: 0,
                            behavior: 'smooth',
                          }),
                      500
                    );
                  console.log("Outside setTimeout", { isWeather })
                  setTimeout(() => {
                    console.log("Enabling optiosn again")
                    setOptionDisabled(false);
                  }, 4001);
                }
              }}>
              <div
                className="onHover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : optionDisabled
                        ? 'var(--font)'
                        : 'var(--secondarygreen)',
                }}>
                <div>{isWeather ? choice?.text : choice}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <RightIcon
                    width="30px"
                    color={
                      optionDisabled ? 'var(--font)' : 'var(--secondarygreen)'
                    }
                  />
                </div>
              </div>
            </ListItem>
          ))
          }
        </List >
      );
    },
    [context, t]
  );

  const getFormattedDate = (datestr: string) => {
    const today = new Date(datestr);
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return dd + '/' + mm + '/' + yyyy;
  };

  const { content, type } = message;
  console.log('#-debug:', content);

  const handleAudio = useCallback(
    (url: any) => {
      // console.log(url)
      if (!url) {
        if (audioFetched) toast.error('No audio');
        // else {
        //   const toastId = toast.loading('Downloading audio');
        //   setTimeout(() => {
        //     toast.dismiss(toastId);
        //   }, 1000);
        // }
        return;
      }
      context?.playAudio(url, content);
      setTtsLoader(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioFetched, content, context?.playAudio]
  );

  const downloadAudio = useCallback(() => {
    const cacheAudio = async (url: string) => {
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/storeaudio`;

      const requestData = {
        queryId: message?.content?.data?.messageId,
        audioUrl: url,
      };

      axios
        .post(apiUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          console.log('Cache Audio Response:', response.data);
        })
        .catch((error) => {
          console.error('Cache Audio Error:', error);
        });
    };

    const fetchAudio = async (text: string) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/aitools/t2s`,
          {
            text: text,
          }
        );
        setAudioFetched(true);
        // cacheAudio(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching audio:', error);
        setAudioFetched(true);
        return null;
      }
    };

    const fetchData = async () => {
      if (
        !message?.content?.data?.audio_url &&
        message?.content?.data?.position === 'left' &&
        message?.content?.text
      ) {
        const toastId = toast.loading(`${t('message.download_audio')}`);
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 1500);
        const audioUrl = await fetchAudio(message?.content?.text);
        setTtsLoader(false);
        if (audioUrl) {
          message.content.data.audio_url = audioUrl;
          handleAudio(audioUrl);
        } else setTtsLoader(false);
      }
    };
    if (message.content?.data?.audio_url) {
      handleAudio(message.content.data.audio_url);
    } else {
      setTtsLoader(true);
      fetchData();
    }
  }, [handleAudio, message.content?.data, message.content?.text, t]);

  const FormattedText = ({ content }: FormattedTextProps) => {
    let words = content.split(' ');
    if (words?.[words?.length - 1] == '' || words?.[words?.length - 1] == ' ') {
      words = words.slice(0, words?.length - 1);
    }

    if (words?.[0] == ':') {
      words = words.slice(1);
    }

    if (words?.[0]?.includes('null')) {
      words[0] = words[0].replace(
        'null',
        localStorage.getItem('locale') == 'en'
          ? "I'm here to help with any agriculture-related questions you might have. Feel free to ask!"
          : 'ଆପଣଙ୍କ ପାଖରେ ଥିବା କୃଷି ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନଗୁଡ଼ିକରେ ସାହାଯ୍ୟ କରିବାକୁ ମୁଁ ଏଠାରେ ଅଛି | ପଚାରିବାକୁ ମୁକ୍ତ ହୁଅନ୍ତୁ!'
      );
    }

    if (words?.[1]?.includes('null')) {
      words[1] = words[1].replace(
        'null',
        localStorage.getItem('locale') == 'en'
          ? "I'm here to help with any agriculture-related questions you might have. Feel free to ask!"
          : 'ଆପଣଙ୍କ ପାଖରେ ଥିବା କୃଷି ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନଗୁଡ଼ିକରେ ସାହାଯ୍ୟ କରିବାକୁ ମୁଁ ଏଠାରେ ଅଛି | ପଚାରିବାକୁ ମୁକ୍ତ ହୁଅନ୍ତୁ!'
      );
    }

    if (
      words?.[words?.length - 2]?.includes('Thank') &&
      words?.[words?.length - 1]?.includes('you')
    ) {
      words[words.length - 2] = words[words.length - 2].replace(
        'Thank',
        '\nThank'
      );
    }

    return (
      <p>
        {words.map((word) => {
          return word + ' ';
        })}
      </p>
    );
  };

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
              <FormattedText content={content?.text} />{' '}
              {content?.data?.position === 'right'
                ? null
                : !content?.data?.isEnd && <BlinkingSpinner />}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
              {content?.data?.position === 'left' &&
                flags?.show_msg_id?.enabled && (
                  <span>
                    <Button
                      colorScheme="teal"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        copyTextToClipboard(content?.data?.messageId)
                          .then(() => {
                            toast.success('coppied');
                          })
                          .catch((err) => {
                            console.log(err);
                          })
                      }>
                      {content?.data?.messageId}
                    </Button>
                  </span>
                )}

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
          {content?.data?.btns ? (
            <div className={styles.offlineBtns}>
              <button onClick={() => window?.location?.reload()}>
                {t('label.refresh')}
              </button>
              <button>
                <a href={`tel:${flags.dialer_number.value}`}>
                  {t('label.call_amakrushi')}
                </a>
              </button>
            </div>
          ) : (
            content?.data?.position === 'left' && (
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  top: '-10px',
                  justifyContent: 'space-between',
                }}>
                <div style={{ display: 'flex' }}>
                  <div
                    className={styles.msgSpeaker}
                    onClick={!ttsLoader ? downloadAudio : () => { }}
                    style={
                      !content?.data?.isEnd
                        ? {
                          pointerEvents: 'none',
                          filter: 'grayscale(100%)',
                          opacity: '0.5',
                        }
                        : {
                          pointerEvents: 'auto',
                          opacity: '1',
                          filter: 'grayscale(0%)',
                        }
                    }>
                    {context?.clickedAudioUrl === content?.data?.audio_url ? (
                      <Image
                        src={
                          !context?.audioPlaying
                            ? SpeakerIcon
                            : SpeakerPauseIcon
                        }
                        width={!context?.audioPlaying ? 15 : 40}
                        height={!context?.audioPlaying ? 15 : 40}
                        alt=""
                      />
                    ) : ttsLoader ? (
                      <Loader />
                    ) : (
                      <Image src={SpeakerIcon} width={15} height={15} alt="" />
                    )}
                    <p
                      style={{
                        fontSize: '11px',
                        color: 'var(--font)',
                        fontFamily: 'Mulish-bold',
                        display: 'flex',
                        alignItems: 'flex-end',
                        marginRight: '1px',
                        padding: '0 5px',
                        marginTop: !context?.audioPlaying ? 0 : '-14px',
                      }}>
                      {t('message.speaker')}
                    </p>
                  </div>
                </div>
                <div className={styles.msgFeedback}>
                  <div className={styles.msgFeedbackIcons}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        paddingRight: '6px',
                      }}
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
                      <p
                        style={{ fontSize: '11px', fontFamily: 'Mulish-bold' }}>
                        {t('label.helpful')}
                      </p>
                    </div>
                    <div
                      style={{
                        height: '32px',
                        width: '1px',
                        backgroundColor: 'var(--secondarygreen)',
                        margin: '6px 0',
                      }}></div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                      onClick={() =>
                        feedbackHandler({
                          like: -1,
                          msgId: content?.data?.messageId,
                        })
                      }>
                      <MsgThumbsDown
                        fill={reaction === -1}
                        width="20px"
                        color="var(--primary)"
                      />
                      <p
                        style={{ fontSize: '11px', fontFamily: 'Mulish-bold' }}>
                        {t('label.not_helpful')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
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
      const videoId = url.split('=')[1];
      return (
        <>
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <iframe
                width="100%"
                height="fit-content"
                src={`https://www.youtube.com/embed/` + videoId}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen></iframe>
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
              isWeather: true,
            })}
          </Bubble>
        </>
      );
    }

    case 'kaliaTable': {
      const personalDetails = JSON.parse(content?.text)?.['Personal Details'];
      const entries = Object.entries(personalDetails);
      const chunkedEntries = [];
      for (let i = 0; i < entries.length; i += 4) {
        chunkedEntries.push(entries.slice(i, i + 4));
      }
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
            <div className={styles.tableContainerKalia}>
              <div className={styles.tableHeaderKalia}>
                <div>
                  <b>{t('table.personalDetails')}</b>
                </div>
                {/* <div>{t('table.header_temp_max')}</div>
                <div>{t('table.header_temp_min')}</div>
                <div>{t('table.header_temp')}</div>
                <div>{t('table.header_humidity')}</div>
                <div>{t('table.header_precip')}</div>
                <div>{t('table.header_precip_prob')}</div>
                <div>{t('table.header_windspeed')}</div>
                <div>{t('table.header_cloudcover')}</div>
                <div>{t('table.header_conditions')}</div> */}
              </div>
              <div className={styles.tableData}>
                {chunkedEntries.map((chunk, rowIndex) => (
                  <div key={rowIndex} className={styles.tableDataRow}>
                    {chunk.map(([field, value]: [any, any], colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className={styles.tableDataColKalia}>
                        <div style={{ borderRight: '1px solid grey' }} className={styles.kaliaCell}>{field}</div>
                        <div style={{}} className={styles.kaliaCell}>{value}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right' ? 'white' : 'var(--font)',
              }}>
              {/* {`\n` +
                JSON.parse(content?.text)?.generalAdvice +
                `\n\n` +
                JSON.parse(content?.text)?.buttonDescription} */}
              {getLists({
                choices: JSON.parse(content?.text)?.buttons,
                isWeather: true,
              })}
            </span>
          </Bubble>
        </div>
      );
    }
    case 'table': {
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
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div>
                  <b>{t('table.header_date')}</b>
                </div>
                <div>{t('table.header_temp_max')}</div>
                <div>{t('table.header_temp_min')}</div>
                <div>{t('table.header_temp')}</div>
                <div>{t('table.header_humidity')}</div>
                <div>{t('table.header_precip')}</div>
                <div>{t('table.header_precip_prob')}</div>
                <div>{t('table.header_windspeed')}</div>
                <div>{t('table.header_cloudcover')}</div>
                <div>{t('table.header_conditions')}</div>
              </div>
              <div className={styles.tableData}>
                {JSON.parse(content?.text)?.weatherData?.map(
                  (el: any, idx: any) => (
                    <div
                      key={el.datetime + idx}
                      className={styles.tableDataCol}>
                      <div>
                        <b> {getFormattedDate(el.datetime)}</b>
                      </div>
                      <div>{el.tempmax} °C </div>
                      <div>{el.tempmin} °C </div>
                      <div>{el.temp} °C </div>
                      <div>{el.humidity} %</div>
                      <div>{el.precip} mm</div>
                      <div>{el.precipprob} % </div>
                      <div>{el.windspeed} m/s</div>
                      <div>{el.cloudcover} %</div>
                      <div>
                        {' '}
                        {intl.locale == 'or'
                          ? oriaWeatherTranslates[
                          el?.conditions
                            ?.trim()
                            ?.split(' ')
                            ?.join('')
                            ?.toLowerCase()
                          ]
                          : el.conditions}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right' ? 'white' : 'var(--font)',
              }}>
              {`\n` +
                JSON.parse(content?.text)?.generalAdvice +
                `\n\n` +
                JSON.parse(content?.text)?.buttonDescription}
              {getLists({
                choices: JSON.parse(content?.text)?.buttons,
                isWeather: true,
              })}
            </span>
          </Bubble>
        </div>
      );
    }
    case 'singleTable': {
      const dataKeys = JSON.parse(content?.text);
      const filteredData = { ...dataKeys };
      delete filteredData['Disclaimer']
      const entries = Object.keys(filteredData);
      const innerData = filteredData?.[entries?.[0]]
      // console.log({ innerData, type: typeof innerData })
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
            <div className={styles.tableContainerKalia}>
              <div className={styles.tableHeaderKalia}>
                <div>
                  <b>{entries?.[0]}</b>
                </div>
              </div>
              <div className={styles.tableData}>
                <div style={{ width: '100%' }} className={styles.tableDataRow}>
                  {typeof innerData == 'string' ?
                    <div className={styles.tableDataColKalia} style={{ flexDirection: 'row' }}>
                      <div className={styles.kaliaCell}>{innerData}</div>
                    </div>
                    : Object?.keys(innerData)?.map((el, idx) => {
                      return <div key={`${idx}_${el}`} className={styles.tableDataColKalia} style={{ flexDirection: 'row' }}>
                        <div style={{ borderRight: '1px solid grey' }} className={styles.kaliaCell}>{el}</div>
                        <div style={{}} className={styles.kaliaCell}>{innerData[el]}</div>
                      </div>
                    })}
                </div>
              </div>
            </div>
            {/* Disclaimer Text */}
            <div className={styles.divider}></div>
            {dataKeys?.['Disclaimer'] && <div > <b>{t('lable.disclaimer')}</b>: {dataKeys?.['Eligibility Status'] ? t('label.eleg_disclaimer') : t('label.grievance_disclaimer')}</div>}
            <span
              className="onHover"
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right' ? 'white' : 'var(--font)',
              }}>
              {/* {`\n` +
              JSON.parse(content?.text)?.generalAdvice +
              `\n\n` +
              JSON.parse(content?.text)?.buttonDescription} */}
              {getLists({
                choices: JSON.parse(content?.text)?.buttons,
                isWeather: true,
              })}
            </span>
          </Bubble >
        </div >
      );
    }

    case 'disbursalHistory': {
      const disclaimer = JSON.parse(content?.text)?.['Disclaimer'] || '';
      const data = JSON.parse(content?.text)?.['Payment Account Details']
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
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}
                style={{ fontSize: '13px', width: '30%', wordWrap: 'break-word', wordBreak: 'break-word', display: 'flex', gap: '0rem' }}
              >
                <p className={styles.tableDataCellHeader}>Name of<br></br> Bank</p>
                <p className={styles.tableDataCellHeader}>IFSC Code</p>
                <p className={styles.tableDataCellHeader}>Payment <br></br>processed Date</p>
                <p className={styles.tableDataCellHeader}>Saving Bank<br></br> Account No</p>
                <p className={styles.tableDataCellHeader}>Payment <br></br>Status </p>
                <p className={styles.tableDataCellHeader}>UTR No</p>
              </div>
              <div className={styles.tableData} >
                {data?.map(
                  (el: any, idx: any) => (
                    <div
                      key={el?.['Name of Bank'] + idx}
                      className={styles.tableDataCol}
                      style={{ fontSize: '13px', padding: '0rem', gap: '0rem', minWidth: '7rem', wordWrap: 'break-word', wordBreak: 'break-word' }}
                    >
                      <div className={styles.tableDataCell} style={{ wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'break-spaces' }}>{el['Name of Bank']}</div>
                      <div className={styles.tableDataCell}>{el['IFSC Code']} </div>
                      <div className={styles.tableDataCell}>{el['Payment processed Date']}</div>
                      <div className={styles.tableDataCell}>{el['Saving Bank Account No.']}</div>
                      <div className={styles.tableDataCell}>{el['Payment Status']}</div>
                      <div className={styles.tableDataCell}>{el['UTR No.']}</div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className={styles.divider}></div>
            {disclaimer && <div> <b>{t('lable.disclaimer')}</b>: {t('label.disbursal_disclaimer')}</div>}
          </Bubble>
        </div>
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
