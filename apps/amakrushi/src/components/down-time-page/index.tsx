'use client';
import Menu from '../menu';
import styles from './index.module.css';
import Image from 'next/image';
import downTimeIcon from '../../assets/images/downtime.png';
import { useLocalization } from '../../hooks';
import { useFlags } from 'flagsmith/react';
import callIcon from '../../assets/icons/call-icon.svg';
import router from 'next/router';

function DownTimePage() {
  const t = useLocalization();
  const flags = useFlags(['dialer_number']);
  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('message.down_time_title')}</div>
      <div className={styles.imageContainer}>
        <Image src={downTimeIcon} alt="downTimeIcon" layout="responsive" />
      </div>
      <span>{t('message.temporarily_down')}</span>
      {/* <p className={styles.miniText}>
        {t("message.temporarily_down_description")}
      </p> */}
      <div className={styles.dialerBox}>
        <a
          href={`tel:${flags.dialer_number.value}`}
          className={styles.footerTitle}>
          <div className={styles.callIconBox}>
            <Image src={callIcon} alt="callIcon" layout="responsive" />
          </div>
          <p style={{textDecoration: 'underline'}}>{t('label.call_amakrushi')}</p>
        </a>
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => window?.location.reload()}>
          {t('message.down_time_retry')}
        </button>
        <button
          type="button"
          className={styles.viewPrevChatsButton}
          onClick={() => {router.push('/history')}}>
          {t('message.down_time_view_prev_chats')}
        </button>
      </div>
      <Menu />
    </div>
  );
}

export default DownTimePage;
