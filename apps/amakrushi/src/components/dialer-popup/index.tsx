import React from 'react';
import callIcon from '../../assets/icons/call-icon.svg';
import crossIcon from '../../assets/icons/crossIcon.svg';
import styles from './index.module.css';
import Image from 'next/image';
import { useFlags } from 'flagsmith/react';
import { useLocalization } from '../../hooks';

const DialerPopup: React.FC<any> = ({ setShowDialerPopup }) => {
  const flags = useFlags(['dialer_number']);
  const t = useLocalization();

  return (
    <div className={styles.main}>
      <div
        className={styles.crossIconBox}
        onClick={() => setShowDialerPopup(false)}>
        <Image src={crossIcon} alt="crossIcon" layout="responsive" />
      </div>
      <p>
        {t('message.dialer_popup')}
      </p>
      <div className={styles.dialerBox}>
        <a
          href={`tel:${flags.dialer_number.value}`}
          className={styles.footerTitle}>
          <div className={styles.callIconBox}>
            <Image src={callIcon} alt="callIcon" layout="responsive" />
          </div>
          {t('label.dial')} {flags.dialer_number.value}
        </a>
      </div>
    </div>
  );
};

export default DialerPopup;
