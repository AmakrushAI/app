'use client';
import Menu from '../menu';
import styles from './index.module.css';
import Image from 'next/image';
import downTimeIcon from '../../assets/icons/down-time.svg';
import { useLocalization } from '../../hooks';

function DownTimePage() {
  const t = useLocalization();
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image src={downTimeIcon} alt="downTimeIcon" layout='responsive' />
      </div>
      <span>{t("message.temporarily_down")}</span>
      <p className={styles.miniText}>
        {t("message.temporarily_down_description")}
      </p>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => window?.location.reload()}>
        {t("message.down_time_retry")}
      </button>
      <Menu />
    </div>
  );
}

export default DownTimePage;
