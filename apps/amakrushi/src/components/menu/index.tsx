import styles from './index.module.css';
import homeIcon from '../../assets/icons/home.svg';
import messageIcon from '../../assets/icons/message-menu.svg';
import menuIcon from '../../assets/icons/menu.svg';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { FC } from 'react';
import { useRouter } from 'next/router';

const Menu: FC = () => {
  const [cookies, setCookies] = useCookies();
  const router = useRouter();

  const urlChanger = (link: string) => {
    if (cookies['access_token'] !== undefined) {
      router.push(link);
    }
  };

  return (
    <div className={styles.menu}>
      <div onClick={() => urlChanger('/')}>
        <Image alt="" src={homeIcon} layout='responsive' />
      </div>
      <div onClick={() => urlChanger('/chats')}>
        <Image alt="" src={messageIcon} layout='responsive' />
      </div>
      <div onClick={() => urlChanger('/more')}>
        <Image alt="" src={menuIcon} layout='responsive' />
      </div>
    </div>
  );
};

export default Menu;
