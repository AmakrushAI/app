import styles from './index.module.css';
import React, { useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import logoutIcon from '../../assets/icons/logout.svg';
import userCircleIcon from '../../assets/icons/user-circle.svg';
import userAltIcon from '../../assets/icons/user-alt.svg';
import questionMarkIcon from '../../assets/icons/question-mark.svg';
import thumbsUpIcon from '../../assets/icons/thumbs-up.svg';
import RightIcon from '../../assets/icons/right.jsx';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import Menu from '../menu';
//@ts-ignore
import { analytics } from '../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { useLocalization } from '../../hooks';
import { AppContext } from '../../context';

const MorePage: React.FC = () => {
  const router = useRouter();
  const context = useContext(AppContext);
  const [cookie, setCookie, removeCookie] = useCookies();
  const t=useLocalization();

  function logout() {
    removeCookie('access_token', { path: '/' });
    localStorage.clear();
    sessionStorage.clear();
    context?.setMessages([]);
    //@ts-ignore
    logEvent(analytics, 'Logout_pressed');
    router.push('/login');
    if(typeof window !== "undefined") window.location.reload();
  }

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'More_page');
  }, []);

  const [welcome, profile, faqs, feedback, logoutLabel,more] =useMemo(()=>[t('label.welcome'),t('label.profile'),t('label.faqs'),t('label.feedback'),t('label.logout'),t('label.more')],[t])
  return (
    <>
      <div className={styles.main}>
        <div className={styles.title}>{more}</div>

        <div className={styles.user}>
          <div className={styles.icon1}>
            <Image src={userCircleIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo}>
            <p style={{ fontWeight: 'bold' }}>{welcome}</p>
            <p style={{ color: 'var(--grey)' }}>
              +91 {localStorage.getItem('phoneNumber')}
            </p>
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/profile')}>
          <div className={styles.icon2}>
            <Image src={userAltIcon} alt="" layout='responsive'/>
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>{profile}</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="45px" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/faq')}>
          <div className={styles.icon2}>
            <Image src={questionMarkIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>{faqs}</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="45px" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/feedback')}>
          <div className={styles.icon2}>
            <Image src={thumbsUpIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>{feedback}</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="45px" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => logout()}>
          <div className={styles.icon2}>
            <Image src={logoutIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>{logoutLabel}</p>
          </div>
          <div className={styles.icon3}>
            <RightIcon width="45px" color="black" />
          </div>
        </div>
      </div>
      <Menu />
    </>
  );
};

export default MorePage;
