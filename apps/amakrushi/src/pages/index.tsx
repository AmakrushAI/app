import type { NextPage } from "next";
import Head from "next/head";
import { CookiesProvider } from "react-cookie";
import { ColorModeScript } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Menu from "../components/menu";
const ChatUiWindow = dynamic(
  () => import("../components/PhoneView/ChatWindow/ChatUiWindow"),
  { ssr: false }
);

const Home: NextPage  = () => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="white" />
        <meta name="UCI Web Channel" content="A project under C4GT" />
        <meta name="mobile-web-app-capable" content="yes"></meta>
        <title>Ama KrushAI</title>
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
