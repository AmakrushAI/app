import styles from './index.module.css';
import React, { useEffect } from 'react';
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

const MorePage: React.FC = () => {
  const router = useRouter();
  const [cookie, setCookie, removeCookie] = useCookies();

  function logout() {
    removeCookie('access_token', { path: '/' });
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('userMsgs');
    localStorage.removeItem('auth');
    //@ts-ignore
    logEvent(analytics, 'Logout_pressed');
    router.push('/login');
  }

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'More_page');
  }, []);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.title}>More</div>

        <div className={styles.user}>
          <div className={styles.icon1}>
            <Image src={userCircleIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo}>
            <p style={{ fontWeight: 'bold' }}>Welcome</p>
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
            <p style={{ fontWeight: 'bold' }}>Profile</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="5.5vh" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/faq')}>
          <div className={styles.icon2}>
            <Image src={questionMarkIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>FAQs</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="5.5vh" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/feedback')}>
          <div className={styles.icon2}>
            <Image src={thumbsUpIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>Feedback</p>
          </div>
          <div className={styles.icon3}>
          <RightIcon width="5.5vh" color="black" />
          </div>
        </div>
        <div className={styles.user} onClick={() => logout()}>
          <div className={styles.icon2}>
            <Image src={logoutIcon} alt="" layout='responsive' />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>Logout</p>
          </div>
          <div className={styles.icon3}>
            <RightIcon width="5.5vh" color="black" />
          </div>
        </div>
      </div>
      <Menu />
    </>
  );
};

export default MorePage;
