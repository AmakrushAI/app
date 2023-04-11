import styles from './index.module.css';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightFromBracket,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaQuestionCircle, FaThumbsUp, FaUserAlt } from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { MdArrowRight } from 'react-icons/md';

const MorePage: React.FC = () => {
  const router = useRouter();
  const [cookie, setCookie, removeCookie] = useCookies();

  function logout() {
    removeCookie('access_token', { path: '/' });
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('userMsgs');
    router.push('/login');
  }

  return (
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
          <FaQuestionCircle />
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
          <FaThumbsUp />
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
  );
};

export default MorePage;
