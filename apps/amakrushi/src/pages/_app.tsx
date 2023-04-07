import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import NavBar from "../components/NavBar";
import ContextProvider from "../context/ContextProvider";
import { ReactNode } from "react";
import "chatui/dist/index.css";
function SafeHydrate({ children }: { children: ReactNode }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
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

export default MyApp;
