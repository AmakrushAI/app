import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

import ContextProvider from "../context/ContextProvider";
import { ReactChildren, ReactElement, useEffect, useState } from "react";
import "chatui/dist/index.css";

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
  const [cookie] = useCookies();
  useEffect(() => {
    setTimeout(() => {
      setLaunch(false);
    }, 2500);
  }, []);

  useEffect(() => {
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
  }, [cookie, router]);

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <ContextProvider>
          <div style={{ height: "100%" }}>
            <NavBar />
            <SafeHydrate>
              <FlagsmithProvider
                flagsmith={flagsmith}
                serverState={flagsmithState}
              >
                <Component {...pageProps} />
              </FlagsmithProvider>
            </SafeHydrate>
          </div>
        </ContextProvider>
      </ChakraProvider>
    );
  }
};

App.getInitialProps = async () => {
  await flagsmith.init({
    environmentID: "cEipWkGBoFT8xFwGHxteh5",
  });
  return { flagsmithState: flagsmith.getState() };
};
export default App;
