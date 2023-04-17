import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faListDots,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

import { useCookies } from "react-cookie";
import { FC } from "react";
import { useRouter } from "next/router";

const Menu: FC = () => {
  const [cookies, setCookies] = useCookies();
  const router=useRouter();
  
  const urlChanger = (link: string) => {
    if (cookies["access_token"] !== undefined) {
      router.push(link);
    }
  };

  return (
    <div className={styles.menu}>
      <button onClick={() => urlChanger("/")}>
        <FontAwesomeIcon icon={faHome} color="white" />
      </button>
      <button onClick={() => urlChanger("/chats")}>
        <FontAwesomeIcon icon={faMessage} color="white" />
      </button>
      <button onClick={() => urlChanger("/more")}>
        <FontAwesomeIcon icon={faListDots} color="white" />
      </button>
    </div>
  );
};

export default Menu;
