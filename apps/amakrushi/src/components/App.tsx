import { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import router from 'next/router';
import { AppContext } from '../context';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { NextPage } from 'next';
import Menu from './Menu';
// @ts-ignore
import { analytics } from '../utils/firebase';
import { logEvent } from 'firebase/analytics';

const ChatUiWindow = dynamic(
  () => import('./PhoneView/ChatWindow/ChatUiWindow'),
  {
    ssr: false,
  }
);
const App: NextPage = () => {
  // For Authentication
  const [accessToken, setAccessToken] = useState('');
  // const [recieved, setrecieved] = useState(false);
  const [cookies, setCookies] = useCookies();

  const { currentUser, allUsers, messages, sendMessage } =
    useContext(AppContext);

  useEffect(() => {
    if (cookies['access_token'] !== undefined) {
      axios
        .get(`http://localhost:3000/api/auth?token=${cookies['access_token']}`)
        .then((response) => {
          if (response.data === null) {
            throw 'Invalid Access Token';
            // router.push("/login");
          }
        })
        .catch((err) => {
          throw err;
        });
      setAccessToken(cookies['access_token']);
    } else {
      router.push('/login');
    }
  }, [cookies]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Home_page');
  }, []);

  return (
    <>
      <div
        style={{position: 'fixed', width: '100%', bottom: '7vh', top: '75px'}}>
        <ChatUiWindow />
      </div>
      <Menu />
    </>
  );
};

export default App;
