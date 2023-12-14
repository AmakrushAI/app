'use client';
import Menu from '../menu';
import styles from './index.module.css';
import Image from 'next/image';
import hourGlassIcon from '../../assets/icons/hourglass.svg';
import { useLocalization } from '../../hooks';

function ComingSoonPage() {
  const t = useLocalization();
  return (
    <div className={styles.container}>
      <span>{t("message.coming_soon")}</span>
      <div className={styles.imageContainer}>
        <Image src={hourGlassIcon} alt="hourGlass" layout='responsive' />
      </div>
      <p className={styles.miniText}>
        {t("message.coming_soon_description")}
      </p>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => window?.history?.back()}>
        {t("label.back")}
      </button>
      {/* <Menu /> */}
    </div>
  );
}

export default ComingSoonPage;
