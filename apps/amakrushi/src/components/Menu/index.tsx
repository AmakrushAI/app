import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faListDots,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';
import router from 'next/router';
import { useCookies } from 'react-cookie';
import { FC } from 'react';

const Menu:FC =()=> {
  const [cookies, setCookies] = useCookies();
  
  const urlChanger = (link: string) => {
    if(cookies['access_token'] !== undefined){
      router.push(link);
    }
  }

  return (
    <div className={styles.menu}>
      <button onClick={() => urlChanger('/')}>
        <FontAwesomeIcon icon={faHome} color="white" />
      </button>
      <button
      onClick={() => urlChanger('/chats')}
      >
        <FontAwesomeIcon icon={faMessage} color="white" />
      </button>
      <button onClick={() => urlChanger('/more')}>
        <FontAwesomeIcon icon={faListDots} color="white" />
      </button>
    </div>
  );
}

export default Menu;
