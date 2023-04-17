import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import Font Awesome CSS
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import NavBar from '../components/NavBar';
import ContextProvider from '../context/ContextProvider';
import React,{ ReactChildren, ReactNode, useEffect, useState } from 'react';
import 'chatui/dist/index.css';
import LaunchPage from '../components/LaunchPage';

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
  useEffect(() => {
      setTimeout(() => {
        setLaunch(false);
      }, 2500);
  }, []);

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <ContextProvider>
          <>
            <NavBar />
            <SafeHydrate>
              <Component {...pageProps} />
            </SafeHydrate>
          </>
        </ContextProvider>
      </ChakraProvider>
    );
  }
}

export default MyApp;
