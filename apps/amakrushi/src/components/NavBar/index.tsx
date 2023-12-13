import { useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import PhoneImg from '../../assets/images/phone.png';
import GovtOfOdisha from '../../assets/images/logo-green.png';
import KrushakOdisha from '../../assets/images/krushak_odisha.png';
import plusIcon from '../../assets/icons/plus.svg';
import homeIcon from '../../assets/icons/home.svg';
import Image from 'next/image';
import { AppContext } from '../../context';
import flagsmith from 'flagsmith/isomorphic';
import router from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useFlags } from 'flagsmith/react';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';
import { Sidemenu } from '../Sidemenu';

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

  const newChatHandler = useCallback(() => {
    if (context?.loading) {
      toast.error(`${t('error.wait_new_chat')}`);
      return;
    }
    const newConversationId = uuidv4();
    sessionStorage.setItem('conversationId', newConversationId);
    if(context?.audioElement) context?.audioElement.pause();
    if(context?.setAudioPlaying) context?.setAudioPlaying(false);
    context?.setConversationId(newConversationId);
    context?.setMessages([]);
    context?.setIsMsgReceiving(false);
    context?.setLoading(false);
    router.push('/');
  }, [context, t]);

  if (router.pathname === '/chat' && !context?.isDown) {
    return (
      <div className={styles.navbar}>
        <div
          style={{ width: '120px', display: 'flex', alignItems: 'flex-end' }}>
          <Sidemenu />
          <div
            style={{
              paddingLeft: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <Image
              src={plusIcon}
              alt=""
              width={28}
              height={28}
              onClick={newChatHandler}
            />
            <p style={{ color: 'var(--primary)', fontSize: '12px' }}>
              {t('label.new_chat')}
            </p>
          </div>
        </div>
        <div
        // style={{
        //   minWidth: '110px',
        //   display: 'flex',
        //   justifyContent: 'space-between',
        // }}
        >
          <Image src={GovtOfOdisha} alt="" width={60} height={60} />
          <Image src={KrushakOdisha} alt="" width={60} height={60} />
          <Image src={PhoneImg} alt="" width={60} height={60} />
        </div>
        {/* <div className={styles.imageContainer2}>
          <Image
            onClick={() => newChatHandler()}
            src={homeIcon}
            alt=""
            width={40}
            height={40}
            onClick={() => {
              router.push('/history');
            }}
          />
          <Image
            src={plusIcon}
            alt=""
            width={40}
            height={40}
          />
        </div> */}
      </div>
    );
  } else
    return (
      <div className={styles.navbar}>
        {localStorage.getItem('phoneNumber') ? (
          <div
            style={{
              width: '120px',
              display: 'flex',
              alignItems: 'center',
            }}>
            {/* <div> */}
            <Sidemenu />
            {/* </div> */}
            {router.pathname !== '/chat' && router.pathname !== '/' ? (
              <div style={{ paddingLeft: '15px' }}>
                <Image
                  src={homeIcon}
                  alt=""
                  width={30}
                  height={30}
                  onClick={() => {
                    router.push('/');
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              id="eng"
              className={isEngActive ? styles.active : styles.btn}
              style={{ borderRadius: '10px 0px 0px 10px' }}
              onClick={toggleLanguage('en')}>
              ENG
            </button>
            <button
              id="hindi"
              className={!isEngActive ? styles.active : styles.btn}
              style={{ borderRadius: '0px 10px 10px 0px' }}
              onClick={toggleLanguage('or')}>
              ଓଡ଼ିଆ
            </button>
          </div>
        )}
        <div
        // style={{
        //   minWidth: '110px',
        //   display: 'flex',
        //   justifyContent: 'space-between',
        // }}
        >
          <Image src={GovtOfOdisha} alt="" width={60} height={60} />
          <Image src={KrushakOdisha} alt="" width={60} height={60} />
          <Image src={PhoneImg} alt="" width={60} height={60} />
        </div>
        {/* <div>
        </div> */}
        {/* {localStorage.getItem('phoneNumber') ? (
          <div className={styles.imageContainer}>
            {router.pathname === '/' ? (
              <Image
                src={chatHistoryIcon}
                alt=""
                width={40}
                height={40}
                onClick={() => {
                  router.push('/history');
                }}
              />
            ) : (
              <Image
                src={homeIcon}
                alt=""
                width={40}
                height={40}
                onClick={() => {
                  router.push('/');
                }}
              />
            )}
          </div>
        ) : (
          null
        )} */}
      </div>
    );
}

export default NavBar;