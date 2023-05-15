import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useLocalization } from "../hooks/useLocalization";
import Menu from "../components/menu";
import { useContext } from "react";
import { AppContext } from "../context";
import styles from "../components/dialer-popup/index.module.css";
import DialerPopUp from "../components/dialer-popup";

const ChatUiWindow = dynamic(
  () => import("../components/PhoneView/ChatWindow/ChatUiWindow"),
  { ssr: false }
);

const Chat: NextPage = () => {
  const t = useLocalization();
  const context = useContext(AppContext);

  return (
    <>
      <Head>
        <title> {t("label.title")}</title>
      </Head>
      {context?.showDialerPopup && (
  <div
    className={styles.overlay}
    onClick={() => context?.setShowDialerPopup(false)}
  >
    {/* Only render the DialerPopup component when showDialerPopup is true */}
      {context?.showDialerPopup && 
        <DialerPopUp 
          setShowDialerPopup={context?.setShowDialerPopup}
        />
      }
  </div>
)}
      
      <div
        style={{
          position: "fixed",
          width: "100%",
          bottom: "7vh",
          top: "70px",
        }}>
        <ChatUiWindow />
      </div>
      <Menu />
    </>
  );
};
export default Chat;
