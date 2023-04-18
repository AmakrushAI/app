import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import ContextProvider from '../context/ContextProvider';
import { ReactChildren, useEffect, useState } from 'react';
import 'chatui/dist/index.css';



import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";

const LaunchPage = dynamic(() => import("../components/LaunchPage"), {
  ssr: false,
});
const NavBar = dynamic(() => import("../components/NavBar"), {
  ssr: false,
});
function SafeHydrate({ children }: { children: ReactChildren }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
   const router=useRouter();
  const [launch, setLaunch] = useState(true);
  const [cookie] = useCookies();
  useEffect(() => {
    setTimeout(() => {
      setLaunch(false);
    }, 2500);
  }, []);

  useEffect(() => {
    if(router.pathname === '/login' || router.pathname.startsWith('/otp')){
      // already logged in then send to home
      if(cookie['access_token'] !== undefined){
        router.push('/');
      }
    }else {
      // not logged in then send to login page
      if(cookie['access_token'] === undefined){
        router.push('/login');
      }
    }
  }, [cookie, router])
  

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
          </div>
        </ContextProvider>
      </ChakraProvider>
    );
  }
}

export default MyApp;
