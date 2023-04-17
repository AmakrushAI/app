import styles from './index.module.css';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightFromBracket,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaUserAlt } from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { MdArrowRight, MdOutlineQuestionMark } from 'react-icons/md';
import { IoIosThumbsUp } from 'react-icons/io';
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
    //@ts-ignore
    logEvent(analytics, 'Logout_pressed')
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
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
          <div className={styles.userInfo}>
            <p style={{ fontWeight: 'bold' }}>Welcome</p>
            <p style={{ color: 'var(--grey)' }}>
              +91 {localStorage.getItem('phoneNumber')}
            </p>
          </div>
        </div>
        <div className={styles.user}>
          <div className={styles.icon2}>
            <FaUserAlt />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>Profile</p>
          </div>
          <div className={styles.icon3}>
            <MdArrowRight />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/faq')}>
          <div className={styles.icon2}>
            <MdOutlineQuestionMark />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>FAQs</p>
          </div>
          <div className={styles.icon3}>
            <MdArrowRight />
          </div>
        </div>
        <div className={styles.user} onClick={() => router.push('/feedback')}>
          <div className={styles.icon2}>
            <IoIosThumbsUp />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>Feedback</p>
          </div>
          <div className={styles.icon3}>
            <MdArrowRight />
          </div>
        </div>
        <div className={styles.user} onClick={() => logout()}>
          <div className={styles.icon2}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </div>
          <div className={styles.userInfo2}>
            <p style={{ fontWeight: 'bold' }}>Logout</p>
          </div>
          <div className={styles.icon3}>
            <MdArrowRight />
          </div>
        </div>
      </div>
      <Menu />
    </>
  );
};

export default MorePage;
