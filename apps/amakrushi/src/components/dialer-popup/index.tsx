import React, { useCallback, useMemo, useState } from 'react';
import crossIcon from '../../assets/icons/crossIcon.svg';
import styles from './index.module.css';
import Image from 'next/image';
import { useLocalization } from '../../hooks';
import axios from 'axios';
import toast from 'react-hot-toast';

const DialerPopup: React.FC<any> = ({ setShowDialerPopup }) => {
  const [review, setReview] = useState('');
  const t = useLocalization();
  const [reviewSubmitted, reviewSubmitError] = useMemo(
    () => [t('message.review_submitted'), t('error.fail_to_submit_review')],
    [t]
  );

  const submitReview = useCallback(
    (r: string) => {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/feedback`,
          {
            review: r,
            phoneNumber: localStorage.getItem('phoneNumber'),
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem('auth')}`,
            },
          }
        )
        .then((response) => {
          toast.success(reviewSubmitted);
          setShowDialerPopup(false);
        })
        .catch((error) => {
          toast.error(reviewSubmitError);
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: error.message,
          });
        });
    },
    [reviewSubmitError, reviewSubmitted, setShowDialerPopup]
  );

  return (
    <div className={styles.main}>
      <div
        className={styles.crossIconBox}
        onClick={() => setShowDialerPopup(false)}>
        <Image src={crossIcon} alt="crossIcon" layout="responsive" />
      </div>
      <p>{t('label.comment')}</p>
      <div className={styles.dialerBox}>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          name="experience-feedback"
          id="experience-feedback"
          cols={35}
          rows={5}
          placeholder={t('message.comment_description')}></textarea>

        <button onClick={() => submitReview(review)}>
          {t('label.submit_feedback')}
        </button>
      </div>
    </div>
  );
};

export default DialerPopup;
