import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import ContextProvider from '../context/ContextProvider';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import 'chatui/dist/index.css';
import { Toaster } from 'react-hot-toast';

import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import flagsmith from 'flagsmith/isomorphic';
import { FlagsmithProvider } from 'flagsmith/react';
import { useLogin } from '../hooks';

import axios from 'axios';
import { messaging, analytics } from '../utils/firebase';
import { getToken } from 'firebase/messaging';
import FcmNotification from '../utils/FcmNotification';
import { logEvent } from 'firebase/analytics';

const LaunchPage = dynamic(() => import('../components/LaunchPage'), {
  ssr: false,
});
const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: false,
});
function SafeHydrate({ children }: { children: ReactElement }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

const App = ({
  Component,
  pageProps,
}: AppProps) => {

  const router = useRouter();
  const { isAuthenticated, login } = useLogin();
  const [launch, setLaunch] = useState(true);
  const [cookie, setCookie, removeCookie] = useCookies();
  const [flagsmithState, setflagsmithState] = useState(null);


  useEffect(() => {
    const isEventLogged = sessionStorage.getItem('isSplashScreenLogged');
    if (!isEventLogged) {
      //@ts-ignore
      logEvent(analytics, 'Splash_screen');
      sessionStorage.setItem('isSplashScreenLogged', 'true');
    }
    
    setTimeout(() => {
      setLaunch(false);
    }, 2500);
  }, []);
  


  useEffect(() =>{
    const getFlagSmithState =async ()=>{
      await flagsmith.init({
        // api: process.env.NEXT_PUBLIC_FLAGSMITH_API,
        environmentID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
      })
      if(flagsmith.getState())
     { 
      //@ts-ignore
      setflagsmithState(flagsmith.getState())
    }
    }
    getFlagSmithState()
   
  },[])

 

  const handleLoginRedirect = useCallback(() => {
    if (router.pathname === '/login' || router.pathname.startsWith('/otp')) {
      // already logged in then send to home

      if (
        cookie['access_token'] &&
        localStorage.getItem('userID')
      ) {
        router.push('/');
      }
    } else {
      // not logged in then send to login page
      if (
        !cookie['access_token'] ||
        !localStorage.getItem('userID')
      ) {

        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
      }
    }
  }, [cookie, removeCookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  useEffect(() => {
    if (!isAuthenticated || !localStorage.getItem('userID')) return;
    // Request user for notification permission
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
        });
        localStorage.setItem('fcm-token', token);
        console.log('Token', token);
      }
    };
    const updateUser = async () => {
      try {
        const userID = localStorage.getItem('userID');
        const user = await axios.get(`/api/getUser?userID=${userID}`);
        const fcmToken = localStorage.getItem('fcm-token');
        if (
          fcmToken &&
          user?.data?.user?.username
        ) {
          if (!user?.data?.user?.data?.fcmToken || fcmToken !== user?.data?.user?.data?.fcmToken) {
            const res = await axios.put(
              `/api/updateUser?userID=${userID}&fcmToken=${fcmToken}&username=${user?.data?.user?.username}`
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    requestPermission();
    updateUser();
  }, [isAuthenticated]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (launch || !flagsmithState) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
          <ContextProvider>
            <div style={{ height: '100%' }}>
              <FcmNotification />
              <Toaster position="top-center" reverseOrder={false} />
              <NavBar />
              <SafeHydrate>
                <Component {...pageProps} />
              </SafeHydrate>
            </div>
          </ContextProvider>
        </FlagsmithProvider>
      </ChakraProvider>
    );
  }
};

// App.getInitialProps = async () => {
//   await flagsmith.init({
//     api: process.env.NEXT_PUBLIC_FLAGSMITH_API,
//     environmentID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID,
//   });
//   return { flagsmithState: flagsmith.getState() };
// };

export default App;
