import { useState, useContext, useCallback } from "react";
import styles from "./index.module.css";
import PhoneImg from "../../assets/images/phone.png";
import GovtOfOdisha from "../../assets/images/logo-green.png";
import KrushakOdisha from "../../assets/images/krushak_odisha.png";
import Image from "next/image";
import { AppContext } from "../../context";
import { getInitialMsgs } from "../../utils/textUtility";

function NavBar() {
  const [isEngActive, setIsEngActive] = useState(
    localStorage.getItem("locale")
      ? localStorage.getItem("locale") === "en"
      : true
  );
  const context = useContext(AppContext);

  const toggleLanguage = useCallback(
    (newLanguage) => () => {
      localStorage.setItem("locale", newLanguage);
      if (context?.messages?.[0]?.exampleOptions) {
        context?.setMessages([getInitialMsgs(newLanguage)]);
      }
      context?.setLocale(newLanguage);
      setIsEngActive((prev) => (prev === true ? false : true));
    },
    [context]
  );

  return (
    <div className={styles.navbar}>
      <div>
        <button
          id="eng"
          className={`${isEngActive ? styles.active : ""}`}
          style={{ borderRadius: "10px 0px 0px 10px" }}
          onClick={toggleLanguage("en")}
        >
          ENG
        </button>
        <button
          id="odiya"
          className={`${!isEngActive ? styles.active : ""}`}
          style={{ borderRadius: "0px 10px 10px 0px" }}
          onClick={toggleLanguage("or")}
        >
          ଓଡ଼ିଆ
        </button>
      </div>
      <div className={`${styles.imageContainer}`}>
        <Image src={PhoneImg} alt="" width={60} height={60} />
        <Image src={KrushakOdisha} alt="" width={60} height={60} />
        <Image src={GovtOfOdisha} alt="" width={70} height={70} />
      </div>
    </div>
  );
}

export default NavBar;
