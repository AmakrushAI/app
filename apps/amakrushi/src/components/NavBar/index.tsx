import { useCallback, useContext, useState } from "react";
import styles from "./index.module.css";
import PhoneImg from "../../assets/images/phone.png";
import GovtOfOdisha from "../../assets/images/logo-green.png";
import KrishiMela from "../../assets/images/KrishiMela.png";
import Image from "next/image";
import { AppContext } from "../../context";


function NavBar() {
 
  const [isEngActive, setIsEngActive] = useState(true);
  const context = useContext(AppContext);

  const toggleLanguage = useCallback(
    (newLanguage) => () => {
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
          ODIYA
        </button>
      </div>
      <div className={`${styles.imageContainer}`}>
        <Image
          className={styles.loginImage}
          src={PhoneImg}
          alt=""
          width={60}
          height={70}
        />
        <Image
          className={styles.loginImage}
          src={KrishiMela}
          alt=""
          width={70}
          height={60}
        />
        <Image
          className={styles.loginImage}
          src={GovtOfOdisha}
          alt=""
          width={70}
          height={70}
        />
      </div>
    </div>
  );
}

export default NavBar;
