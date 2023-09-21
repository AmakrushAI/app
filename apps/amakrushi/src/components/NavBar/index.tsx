import { useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import PhoneImg from '../../assets/images/phone.png';
import GovtOfOdisha from '../../assets/images/logo-green.png';
import KrushakOdisha from '../../assets/images/krushak_odisha.png';
import plusIcon from '../../assets/icons/plus.svg';
import shareIcon from '../../assets/icons/share.svg';
import downloadIcon from '../../assets/icons/download.svg';
import Image from 'next/image';
import { AppContext } from '../../context';
import flagsmith from 'flagsmith/isomorphic';
import router from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useFlags } from 'flagsmith/react';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';
const axios = require('axios');

function NavBar() {
  const flags = useFlags(['show_download_button', 'show_share_button']);
  const defaultLang = flagsmith.getValue('default_lang', { fallback: 'or' });
  const [isEngActive, setIsEngActive] = useState(
    localStorage.getItem('locale')
      ? localStorage.getItem('locale') === 'en'
      : defaultLang === 'en'
  );
  const context = useContext(AppContext);
  const t = useLocalization();

  const toggleLanguage = useCallback(
    (newLanguage: string) => () => {
      localStorage.setItem('locale', newLanguage);
      context?.setLocale(newLanguage);
      setIsEngActive((prev) => (prev === true ? false : true));
    },
    [context]
  );

  const downloadShareHandler = async (type: string) => {
    try {
      const url = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/user/chathistory/generate-pdf-url/${sessionStorage.getItem(
        'conversationId'
      )}`;

      const response = await axios.post(url, null, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('auth')}`,
        }
      });
      const pdfUrl = response.data.pdfUrl;
      window.open(pdfUrl)

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const file = new File([blob], 'Chat.pdf', {type: blob.type});

      if (type === 'download') {
        toast.success(`${t('message.downloading')}`);
        const link = document.createElement('a');

        // link.href = pdfUrl;
        link.target = "_blank";
        link.href = window.URL.createObjectURL(blob);

        link.download = 'Chat.pdf';
        link.click();
      } else if (type === 'share') {
        if (navigator.canShare({ files: [file] })) {
          toast.success(`${t('message.sharing')}`);
          await navigator
            .share({
              files: [file],
              title: 'Chat',
              text: 'Check out my chat with AmaKrushAI!',
            })
            .catch((error) => {
              toast.error(error);
              console.error('Error sharing', error);
            });
        } else {
          toast.error(`${t('message.cannot_share')}`);
          console.error("Your system doesn't support sharing this file.");
        }
      } else {
        console.log(response.data);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const newChatHandler = useCallback(() => {
    if (context?.loading) {
      toast.error(`${t('error.wait_new_chat')}`);
      return;
    }
    const newConversationId = uuidv4();
    sessionStorage.setItem('conversationId', newConversationId);
    context?.setConversationId(newConversationId);
    context?.setMessages([]);
    context?.setIsMsgReceiving(false);
    context?.setLoading(false);
    router.push('/');
  }, [context, t]);

  if (router.pathname === '/chat' && !context?.isDown) {
    return (
      <div className={styles.navbar2}>
        <div className={styles.newChatContainer}>
          <div
            onClick={() => newChatHandler()}
            className={styles.iconContainer}>
            <Image src={plusIcon} alt="plusIcon" layout="responsive" />
          </div>
          {t('label.new_chat')}
        </div>
        <div className={styles.rightSideIcons}>
          {flags?.show_share_button?.enabled && (
            <div
              className={styles.iconContainer}
              onClick={() => downloadShareHandler('share')}>
              <Image src={shareIcon} alt="shareIcon" layout="responsive" />
            </div>
          )}
          {flags?.show_download_button?.enabled && (
            <div
              className={styles.iconContainer}
              onClick={() => downloadShareHandler('download')}>
              <Image
                src={downloadIcon}
                alt="downloadIcon"
                layout="responsive"
              />
            </div>
          )}
        </div>
      </div>
    );
  } else
    return (
      <div className={styles.navbar}>
        <div>
          <button
            id="eng"
            className={isEngActive ? styles.active : ''}
            style={{ borderRadius: '10px 0px 0px 10px' }}
            onClick={toggleLanguage('en')}>
            ENG
          </button>
          <button
            id="odiya"
            className={!isEngActive ? styles.active : ''}
            style={{ borderRadius: '0px 10px 10px 0px' }}
            onClick={toggleLanguage('or')}>
            ଓଡ଼ିଆ
          </button>
        </div>
        <div className={styles.imageContainer}>
          <Image src={PhoneImg} alt="" width={60} height={60} />
          <Image src={KrushakOdisha} alt="" width={60} height={60} />
          <Image src={GovtOfOdisha} alt="" width={70} height={70} />
        </div>
      </div>
    );
}

export default NavBar;
