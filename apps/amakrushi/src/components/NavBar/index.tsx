import { useState } from 'react';
import styles from './index.module.css';
import PhoneImg from '../../assets/images/phone.png';
import GovtOfOdisha from '../../assets/images/logo-green.png';
import KrushakOdisha from '../../assets/images/krushak_odisha.png';
import Image from 'next/image';

function NavBar() {
  const [lang, setLang] = useState('eng');

  function engHandler() {
    if (lang === 'odiya') {
      setLang('eng');
      document.getElementById('eng')?.classList.add('NavBar_active__Qd_zQ');
      document.getElementById('odiya')?.classList.remove('NavBar_active__Qd_zQ');
    }
  }

  function odiyaHandler() {
    if (lang === 'eng') {
      setLang('odiya');
      document.getElementById('eng')?.classList.remove('NavBar_active__Qd_zQ');
      document.getElementById('odiya')?.classList.add('NavBar_active__Qd_zQ');
    }
  }

  return (
    <div className={styles.navbar}>
      <div>
        <button
          id="eng"
          className={styles.active}
          style={{ borderRadius: '10px 0px 0px 10px' }}
          onClick={engHandler}>
          ENG
        </button>
        <button
          id="odiya"
          style={{ borderRadius: '0px 10px 10px 0px' }}
          onClick={odiyaHandler}>
          ଓଡ଼ିଆ
        </button>
      </div>
      <div className={`${styles.imageContainer}`}>
        <Image
          src={PhoneImg}
          alt=""
          width={60}
          height={60}
        />
        <Image
          src={KrushakOdisha}
          alt=""
          width={60}
          height={60}
        />
        <Image
          src={GovtOfOdisha}
          alt=""
          width={70}
          height={70}
        />
      </div>
    </div>
  );
}

export default NavBar;
