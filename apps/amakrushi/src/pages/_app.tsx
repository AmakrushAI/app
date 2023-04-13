import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import Font Awesome CSS
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import NavBar from '../components/NavBar';
import ContextProvider from '../context/ContextProvider';
import { ReactChildren, useEffect, useState } from 'react';
import 'chatui/dist/index.css';
import LaunchPage from '../components/LaunchPage';
import Menu from '../components/Menu';
import router from 'next/router';
import { useCookies } from 'react-cookie';
function SafeHydrate({ children }: { children: ReactChildren }) {
  return (
    <div suppressHydrationWarning>
       { 
       typeof window === 'undefined' ? null : children
       }
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const [launch, setLaunch] = useState(true);
  const [cookie] = useCookies();
  useEffect(() => {
      setTimeout(() => {
        setLaunch(false);
      }, 2500);
  }, []);

  useEffect(() => {
    if(router.pathname === '/login' || router.pathname.startsWith('/otp')){
      // do nothing
    }else {
      if(cookie['access_token'] === undefined){
        router.push('/login');
      }
    }
  }, [cookie])
  

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <ContextProvider>
          <div style={{height: '100%'}}>
            <NavBar />
            <SafeHydrate>
              <Component {...pageProps} />
            </SafeHydrate>
            <Menu/>
          </div>
        </ContextProvider>
      </ChakraProvider>
    );
  }
}

export default MyApp;
