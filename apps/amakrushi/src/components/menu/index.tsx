import styles from './index.module.css';
import homeIcon from '../../assets/icons/home.svg';
import messageIcon from '../../assets/icons/message-menu.svg';
import menuIcon from '../../assets/icons/menu.svg';
import Image from 'next/image';
import { useCookies } from 'react-cookie';
import { FC, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import toast from 'react-hot-toast';

const Menu: FC = () => {
  const t = useLocalization();
  const [cookies, setCookies] = useCookies();
  const context = useContext(AppContext);
  const router = useRouter();

  const urlChanger = (link: string) => {
    if(context?.audioElement) context?.audioElement.pause();
    if (cookies['access_token'] !== undefined) {
      if(link === '/history' && context?.loading){   
        toast.error(`${t("error.wait_new_chat")}`);
        return;        
    }
      router.push(link);
    }
  };

  const homeUrlChanger = useCallback(() => {
    if (cookies['access_token'] !== undefined) {
      if(context?.messages?.length !== 0){
        router.push('/chat');
      }else router.push('/');
    }
  }, [context?.messages, cookies, router]);

  return (
    <div className={styles.menu}>
      <div onClick={homeUrlChanger}>
        <Image alt="homeIcon" src={homeIcon} layout='responsive' />
      </div>
      <div onClick={() => urlChanger('/history')}>
        <Image alt="messageIcon" src={messageIcon} layout='responsive' />
      </div>
      <div onClick={() => urlChanger('/more')}>
        <Image alt="menuIcon" src={menuIcon} layout='responsive' />
      </div>
    </div>
  );
};

export default Menu;
