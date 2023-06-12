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
import FeaturePopup from '../components/FeaturePopup';

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

const App = ({ Component, pageProps }: AppProps) => {
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

  useEffect(() => {
    const getFlagSmithState = async () => {
      await flagsmith.init({
        // api: process.env.NEXT_PUBLIC_FLAGSMITH_API,
        environmentID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
      });
      if (flagsmith.getState()) {
        //@ts-ignore
        setflagsmithState(flagsmith.getState());
      }
    };
    getFlagSmithState();
  }, []);

  const handleLoginRedirect = useCallback(() => {
    if (router.pathname === '/login' || router.pathname.startsWith('/otp')) {
      // already logged in then send to home
      if (cookie['access_token'] && localStorage.getItem('userID')) {
        router.push('/');
      }
    } else {
      // not logged in then send to login page
      if (!cookie['access_token'] || !localStorage.getItem('userID')) {
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
      }
    }
  }, [cookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  const updateUser = useCallback(
    async (
      fcmToken: string | null | undefined
      // permissionPromise: Promise<string | null>
    ): Promise<void> => {
      try {
        const userID = localStorage.getItem('userID');
        const user = await axios.get(`/api/getUser?userID=${userID}`);
        console.log('i am inside updateUser');
        if (
          fcmToken &&
          user?.data?.user?.username &&
          fcmToken !== user?.data?.user?.data?.fcmToken
        ) {
          await axios.put(
            `/api/updateUser?userID=${userID}&fcmToken=${fcmToken}&username=${user?.data?.user?.username}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    const userID = localStorage.getItem('userID');
    if (isAuthenticated || userID) {
      const requestPermission = async (): Promise<string | null> => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
          });
          localStorage.setItem('fcm-token', token);
          console.log('Token', token);
          return token;
        }
        return null; // Return null if permission isn't granted
      };

      const updateAndRequestPermission = async (): Promise<void> => {
        const permissionPromise = await requestPermission();
        console.log({ permissionPromise });
        await updateUser(permissionPromise);
      };

      updateAndRequestPermission();
    }
  }, [isAuthenticated, updateUser]);

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
              <FeaturePopup />
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

export default App