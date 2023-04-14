import { FaStar } from 'react-icons/fa';
import styles from './index.module.css';
import React, { useEffect } from 'react';
import Menu from '../../Menu';
//@ts-ignore
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';

const MorePage: React.FC = () => {
  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Feedback_page');
  }, []);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.title}>Feedback</div>
        <div className={styles.rating}>
          <h1>Did you find this useful?</h1>
          <div className={styles.stars}>
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </div>
          <p>Tap a star to rate</p>
          <button>Submit Review</button>
        </div>
        <div className={styles.review}>
          <h1>Write your review (optional)</h1>
          <textarea
            name=""
            id=""
            cols={35}
            rows={5}
            placeholder="Please write your experience's feedback."></textarea>
          <button>Submit Review</button>
        </div>
      </div>
      <Menu />
    </>
  );
};

export default MorePage;
