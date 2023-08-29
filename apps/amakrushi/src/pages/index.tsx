import type { NextPage } from "next";
import Head from "next/head";
import { CookiesProvider } from "react-cookie";
import { ColorModeScript } from "@chakra-ui/react";
import { useLocalization } from "../hooks/useLocalization";
import HomePage from "../components/HomePage";

const Home: NextPage = () => {
  const t = useLocalization();

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="white" />
        <meta name="UCI Web Channel" content="A project under C4GT" />
        <title> {t("label.title")}</title>
      </Head>

      <CookiesProvider>
        <div
          style={{
            position: "fixed",
            width: "100%",
            bottom: "7vh",
            top: "75px",
          }}
        >
          <HomePage />
          {/* <DownTimePage/> */}
        </div>
        <ColorModeScript />
      </CookiesProvider>
    </>
  );
};
export default Home;
