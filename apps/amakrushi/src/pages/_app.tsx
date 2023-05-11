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

const LaunchPage = dynamic(() => import('../components/LaunchPage'), {
  ssr: false,
});
const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: false,
});
function SafeHydrate({ children }: { children: ReactElement }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

const App = ({
  Component,
  pageProps,
  flagsmithState,
}: AppProps & { flagsmithState: any }) => {
  console.log("asdfg:",{flagsmithState})
  const router = useRouter();
  const { isAuthenticated, login } = useLogin();
  const [launch, setLaunch] = useState(true);
  const [cookie, setCookie, removeCookie] = useCookies();
  useEffect(() => {
    setTimeout(() => {
      setLaunch(false);
    }, 2500);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    if (router.pathname === "/login" || router.pathname.startsWith("/otp")) {
      // already logged in then send to home
      if (cookie["access_token"] !== undefined && localStorage.getItem('phoneNumber')) {
        router.push("/");
      }
    } else {
      // not logged in then send to login page
      if (cookie["access_token"] === undefined || !localStorage.getItem('phoneNumber')) {
        localStorage.clear();
        sessionStorage.clear();
        router.push("/login");
      }
    }
  }, [cookie, router]);

  useEffect(() => {
    handleLoginRedirect();
  }, [handleLoginRedirect]);

  useEffect(() => {
      if(!isAuthenticated){
        login();
      }
  }, [isAuthenticated, login]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }


  useEffect(()=>{
    // axios
    // .get(`/api/sha`)
    // .then((response) => {
    //  console.warn("sha:",{response})
    // })
    // .catch((err) => {
    //   console.error("sha error:",{err})
    // });
    const shaFull = require('child_process').execSync(`git rev-parse HEAD`).toString().trim();
    console.log("sha:",{shaFull})
  },[]);

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
          <ContextProvider>
            <div style={{ height: '100%' }}>
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

App.getInitialProps = async () => {
  await flagsmith.init({
    api:process.env.NEXT_PUBLIC_FLAGSMITH_API,
    environmentID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID
    
  });
  return { flagsmithState: flagsmith.getState() };
};
export default App;
