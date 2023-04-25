import { useState, useContext, useCallback } from 'react';
import styles from './index.module.css';
import PhoneImg from '../../assets/images/phone.png';
import GovtOfOdisha from '../../assets/images/logo-green.png';
import KrushakOdisha from '../../assets/images/krushak_odisha.png';
import plusIcon from '../../assets/icons/plus.svg';
import shareIcon from '../../assets/icons/share.svg';
import downloadIcon from '../../assets/icons/download.svg';
import Image from 'next/image';
import { AppContext } from '../../context';
import { getInitialMsgs } from '../../utils/textUtility';
import flagsmith from 'flagsmith/isomorphic';
import router from 'next/router';

function NavBar() {
  const defaultLang = flagsmith.getValue('default_lang', { fallback: 'en' });
  const [isEngActive, setIsEngActive] = useState(
    localStorage.getItem('locale')
      ? localStorage.getItem('locale') === 'en'
      : defaultLang === 'en'
  );
  const context = useContext(AppContext);

  const toggleLanguage = useCallback(
    (newLanguage:string) => () => {
      localStorage.setItem('locale', newLanguage);
      if (context?.messages?.[0]?.exampleOptions) {
        context?.setMessages([getInitialMsgs(newLanguage)]);
      }
      context?.setLocale(newLanguage);
      setIsEngActive((prev) => (prev === true ? false : true));
    },
    [context]
  );

  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
      // Check if both variables are equal
      if (obj1 === obj2) {
          return true;
      }
  
      // Check if both variables are not null and are of type "object"
      if (
        typeof obj1 === 'object' &&
        obj1 != null &&
        typeof obj2 === 'object' &&
        obj2 != null
      ) {
          // Get object keys
          const keys1 = Object.keys(obj1);
          const keys2 = Object.keys(obj2);
  
          // If number of keys don't match, objects aren't equal
          if (keys1.length !== keys2.length) {
              return false;
          }
  
          // Check each key recursively
          for (const key in obj1) {
              if (!deepEqual(obj1[key], obj2[key])) {
                  return false;
              }
          }
  
          // Objects must be equal
          return true;
      }
  
      // Compare non-object values
      return obj1 === obj2;
  }, []);
  

  const newChatHandler = useCallback(() => {
    const oldHistoryString = localStorage.getItem('history');
    const oldHistory = oldHistoryString ? JSON.parse(oldHistoryString) : {};
    
    const sessionNames = Object.keys(oldHistory);
    let foundMatchingSession = false;
  
    // Loop over all of the sessions in oldHistory and check if any of them have the same messages as context?.messages.
    for (let i = 0; i < sessionNames.length; i++) {
      const sessionMessages = oldHistory[sessionNames[i]];
      
      if (deepEqual(sessionMessages, context?.messages)) {
        // If we find a matching session, clear the chat input and exit the loop.
        context?.setMessages([]);
        foundMatchingSession = true;
        break;
      }
    }
  
    if (!foundMatchingSession) {
      // If we didn't find a matching session, create a new one with context?.messages and add it to the history object.
      const nextSessionNumber = sessionNames.length + 1;
      const nextSessionName = `session${nextSessionNumber}`;
      const newHistory = { ...oldHistory, [nextSessionName]: [...context?.messages] };
  
      localStorage.setItem('history', JSON.stringify(newHistory));
      context?.setMessages([]);
    }
    router.push('/');
  }, [context, deepEqual]);
  
  
  

  if (router.pathname === '/chat') {
    return (
      <div className={styles.navbar2}>
        <div className={styles.newChatContainer}>
          <div onClick={() => newChatHandler()} className={styles.iconContainer}>
            <Image src={plusIcon} alt="plusIcon" layout="responsive" />
          </div>
          New chat
        </div>
        <div className={styles.rightSideIcons}>
          <div className={styles.iconContainer}>
            <Image src={shareIcon} alt="shareIcon" layout="responsive" />
          </div>
          <div className={styles.iconContainer}>
            <Image src={downloadIcon} alt="downloadIcon" layout="responsive" />
          </div>
        </div>
      </div>
    );
  } else
    return (
      <div className={styles.navbar}>
        <div>
          <button
            id="eng"
            className={isEngActive ? styles.active : ''}
            style={{ borderRadius: '10px 0px 0px 10px' }}
            onClick={toggleLanguage('en')}>
            ENG
          </button>
          <button
            id="odiya"
            className={!isEngActive ? styles.active : ''}
            style={{ borderRadius: '0px 10px 10px 0px' }}
            onClick={toggleLanguage('or')}>
            ଓଡ଼ିଆ
          </button>
        </div>
        <div className={styles.imageContainer}>
          <Image src={PhoneImg} alt="" width={60} height={60} />
          <Image src={KrushakOdisha} alt="" width={60} height={60} />
          <Image src={GovtOfOdisha} alt="" width={70} height={70} />
        </div>
      </div>
    );
}

export default NavBar;
