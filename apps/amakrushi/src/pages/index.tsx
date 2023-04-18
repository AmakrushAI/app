import type { NextPage } from "next";
import Head from "next/head";
import { CookiesProvider } from "react-cookie";
import { ColorModeScript } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useLocalization } from "../hooks/useLocalization";
import Menu from "../components/menu";
const ChatUiWindow = dynamic(
  () => import("../components/PhoneView/ChatWindow/ChatUiWindow"),
  { ssr: false }
);

const Home: NextPage  = () => {
  const t=useLocalization();
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="white" />
        <meta name="UCI Web Channel" content="A project under C4GT" />
        <title> {t("title")}</title>
      </Head>
    
      <CookiesProvider>
        <div style={{position: 'fixed', width: '100%', bottom: '7vh', top: '75px'}}>
        <ChatUiWindow />
        </div>
        <Menu />
      <ColorModeScript />
      </CookiesProvider>
    </>
  );
};
export default Home;
