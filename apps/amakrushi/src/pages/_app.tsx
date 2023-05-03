import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import  jwt  from 'jsonwebtoken';
import ContextProvider from "../context/ContextProvider";
import { ReactElement, useEffect, useState } from "react";
import "chatui/dist/index.css";
import { Toaster } from "react-hot-toast";

import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import flagsmith from "flagsmith/isomorphic";
import { FlagsmithProvider } from "flagsmith/react";

const LaunchPage = dynamic(() => import("../components/LaunchPage"), {
  ssr: false,
});
const NavBar = dynamic(() => import("../components/NavBar"), {
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
  const router = useRouter();
  const [launch, setLaunch] = useState(true);
  const [cookie, setCookie, removeCookie] = useCookies();
  useEffect(() => {
    setTimeout(() => {
      setLaunch(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const decodedToken = jwt.decode(cookie['access_token']);
    const expires = new Date(decodedToken?.exp * 1000);
    if (expires < new Date()) {
      removeCookie('access_token', { path: '/' });
      router.push('/login');
      return;
    }

    if (router.pathname === "/login" || router.pathname.startsWith("/otp")) {
      // already logged in then send to home
      if (cookie["access_token"] !== undefined) {
        router.push("/");
      }
    } else {
      // not logged in then send to login page
      if (cookie["access_token"] === undefined) {
        router.push("/login");
      }
    }
  }, [cookie, removeCookie, router]);

  if (process.env.NODE_ENV === "production") {
    globalThis.console.log = () => {};
  }

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}>
          <ContextProvider>
            <div style={{ height: "100%" }}>
              <Toaster position="top-center" reverseOrder={false}  />
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
    environmentID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID,
  });
  return { flagsmithState: flagsmith.getState() };
};
export default App;
