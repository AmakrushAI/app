import styles from './index.module.css';
import KrushakOdisha from '../../assets/images/krushak_odisha.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function LaunchPage() {
  const [title, setTitle] = useState('ଆମ କୃଷି ଏ ଆଇ ଚାଟ୍ ବୋଟ୍');

  useEffect(() => {
    if (localStorage.getItem('locale') === 'en') {
      setTitle('Ama Krushi AI Chatbot');
    } else {
      setTitle('ଆମ କୃଷି ଏ ଆଇ ଚାଟ୍ ବୋଟ୍');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem('locale')]);

  return (
    <div className={`${styles.container}`}>
      <Image
        className={styles.loginImage}
        src={KrushakOdisha}
        alt="KrushakOdisha"
        width={220}
        height={233}
      />
      <span>{title}</span>
    </div>
  );
}

export default LaunchPage;
