import { useEffect, useState } from 'react';
import styles from './index.module.css';
import PhoneImg from '../../assets/images/phone.png';
import GovtOfOdisha from '../../assets/images/logo-green.png';
import KrishiMela from '../../assets/images/KrishiMela.png';
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

  // useEffect(() => {
  //   var addScript = document.createElement('script');
  //   addScript.setAttribute(
  //     'src',
  //     '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  //   );
  //   document.body.appendChild(addScript);
  //   window.googleTranslateElementInit = googleTranslateElementInit;
  // }, []);

  // const googleTranslateElementInit = () => {
  //   new window.google.translate.TranslateElement(
  //     {
  //       pageLanguage: 'en',
  //       includedLanguages: 'en,or', // If you remove it, by default all google supported language will be included
  //       layout: google.translate.TranslateElement.InlineLayout.VERTICAL,
  //     },
  //     'google_translate_element'
  //   );
  // };

  return (
    <div className={styles.navbar}>
      <div>
        {/* <div id="google_translate_element"></div> */}
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
          ODIYA
        </button>
      </div>
      <div className={`${styles.imageContainer}`}>
        <Image
          className={styles.loginImage}
          src={PhoneImg}
          alt=""
          width={60}
          height={70}
        />
        <Image
          className={styles.loginImage}
          src={KrishiMela}
          alt=""
          width={70}
          height={60}
        />
        <Image
          className={styles.loginImage}
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
