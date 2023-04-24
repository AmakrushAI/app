import starIcon from '../../../assets/icons/star.svg';
import starOutlineIcon from '../../../assets/icons/star-outline.svg';
import Image from 'next/image';
import styles from './index.module.css';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Menu from '../../menu';
//@ts-ignore
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import ComingSoonPage from '../../coming-soon-page';
import { useFlags } from 'flagsmith/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../../../context';
import { useLocalization } from '../../../hooks';

const MorePage: React.FC = () => {
  const t =useLocalization();
  const context = useContext(AppContext);
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState('');
  const flags = useFlags(['show_feedback_page']);
  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Feedback_page');
  }, []);

  const [submitError,ratingSubmitted,reviewSubmitted,reviewSubmitError] =useMemo(()=>[t('error.fail_to_submit'),t('message.rating_submitted'),t('message.review_submitted'),t('error.fail_to_submit_review')],[t])
  const submitReview = useCallback((r: number | string) => {
   
    if (typeof r === "number") {
      axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/feedback`, {
        rating: r,
        phoneNumber: localStorage.getItem('phoneNumber'),
        userId: context?.socketSession?.userID,
      })
        .then(response => {
          toast.success(ratingSubmitted);
        })
        .catch(error => {
          toast.error(submitError);
        });
    } else if (typeof r === "string") {
      axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/feedback`, {
        review: r,
        phoneNumber: localStorage.getItem('phoneNumber'),
        userId: context?.socketSession?.userID,
      })
      .then(response => {
        toast.success(reviewSubmitted)
      })
      .catch(error => {
        toast.error(reviewSubmitError)
      });
    }
  }, [context?.socketSession?.userID, ratingSubmitted, reviewSubmitError, reviewSubmitted, submitError]);

  if (!flags?.show_feedback_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>Feedback</div>
          <div className={styles.rating}>
            <h1>Did you find this useful?</h1>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, index) => {
                if (index + 1 <= rating) {
                  return (
                    <div onClick={() => setRating(index + 1)} key={index} className={styles.star}>
                      <Image src={starIcon} alt="" width={50} height={50} />
                    </div>
                  );
                } else {
                  return (
                    <div onClick={() => setRating(index + 1)} key={index} className={styles.star}>
                      <Image
                        src={starOutlineIcon}
                        alt=""
                        width={50}
                        height={50}
                      />
                    </div>
                  );
                }
              })}
            </div>
            <p>Tap a star to rate</p>
            <button onClick={() => submitReview(rating)}>Submit Review</button>
          </div>
          <div className={styles.review}>
            <h1>Write your review (optional)</h1>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              name="experience-feedback"
              id="experience-feedback"
              cols={35}
              rows={5}
              placeholder="Please write your experience's feedback."></textarea>
            
            <button onClick={() => submitReview(review)}>Submit Review</button>
          </div>
        </div>
        <Menu />
      </>
    );
};

export default MorePage;
