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

function NavBar() {
  const flags = useFlags(['show_download_button', 'show_share_button']);
  const defaultLang = flagsmith.getValue('default_lang', { fallback: 'en' });
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

  const newChatHandler = useCallback(() => {
    if(context?.loading){
      toast.error(`${t("error.wait_new_chat")}`);
      return;
    }
    const newConversationId = uuidv4();
    localStorage.setItem('conversationId', newConversationId);
    context?.setConversationId(newConversationId);
    context?.setMessages([]);
    context?.setIsMsgReceiving(false);
    context?.setLoading(false);
    router.push('/');
  }, [context, t]);

  if (router.pathname === '/chat') {
    return (
      <div className={styles.navbar2}>
        <div className={styles.newChatContainer}>
          <div
            onClick={() => newChatHandler()}
            className={styles.iconContainer}>
            <Image src={plusIcon} alt="plusIcon" layout="responsive" />
          </div>
          {t("label.new_chat")}
        </div>
        <div className={styles.rightSideIcons}>
          {flags?.show_share_button?.enabled && (
            <div className={styles.iconContainer}>
              <Image src={shareIcon} alt="shareIcon" layout="responsive" />
            </div>
          )}
          {flags?.show_download_button?.enabled && (
            <div className={styles.iconContainer}>
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
