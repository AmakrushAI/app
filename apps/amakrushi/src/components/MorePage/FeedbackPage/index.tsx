import starIcon from '../../../assets/icons/star.svg';
import starOutlineIcon from '../../../assets/icons/star-outline.svg';
import Image from 'next/image';
import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

const FeedbackPage: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState('');
  const flags = useFlags(['show_feedback_page']);
  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Feedback_page');
  }, []);

  const [submitError, ratingSubmitted, reviewSubmitted, reviewSubmitError] =
    useMemo(
      () => [
        t('error.fail_to_submit'),
        t('message.rating_submitted'),
        t('message.review_submitted'),
        t('error.fail_to_submit_review'),
      ],
      [t]
    );
  const [feedback, ratingLabel] = useMemo(
    () => [t('label.feedback'), t('message.rating')],
    [t]
  );

  const submitReview = useCallback(
    (r: number | string) => {
      if (typeof r === 'number') {
        axios
          .post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/feedback`,
            {
              rating: r,
              phoneNumber: localStorage.getItem('phoneNumber'),
            },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem('auth')}`,
              },
            }
          )
          .then((response) => {
            toast.success(ratingSubmitted);
          })
          .catch((error) => {
            toast.error(submitError);
            //@ts-ignore
            logEvent(analytics, 'console_error', {
              error_message: error.message,
            });
          });
      } else if (typeof r === 'string') {
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
          })
          .catch((error) => {
            toast.error(reviewSubmitError);
            //@ts-ignore
            logEvent(analytics, 'console_error', {
              error_message: error.message,
            });
          });
      }
    },
    [ratingSubmitted, reviewSubmitError, reviewSubmitted, submitError]
  );

  if (!flags?.show_feedback_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>{feedback}</div>
          <div className={styles.rating}>
            <h1>{ratingLabel}</h1>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, index) => {
                if (index + 1 <= rating) {
                  return (
                    <div
                      onClick={() => setRating(index + 1)}
                      key={index}
                      className={styles.star}>
                      <Image src={starIcon} alt="starIcon" width={50} height={50} />
                    </div>
                  );
                } else {
                  return (
                    <div
                      onClick={() => setRating(index + 1)}
                      key={index}
                      className={styles.star}>
                      <Image
                        src={starOutlineIcon}
                        alt="starOutlineIcon"
                        width={50}
                        height={50}
                      />
                    </div>
                  );
                }
              })}
            </div>
            <p>{t('message.rating_description')}</p>
            <button onClick={() => submitReview(rating)}>
              {t('label.submit_review')}
            </button>
          </div>
          <div className={styles.review}>
            <h1>{t('message.review')}</h1>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              name="experience-feedback"
              id="experience-feedback"
              cols={35}
              rows={5}
              placeholder={t("message.review_description")}></textarea>

            <button onClick={() => submitReview(review)}>
              {t("label.submit_review")}
            </button>
          </div>
        </div>
        {/* <Menu /> */}
      </>
    );
};

export default FeedbackPage;
