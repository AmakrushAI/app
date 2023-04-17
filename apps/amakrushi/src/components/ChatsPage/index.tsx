import styles from "./index.module.css";
import React from "react";
import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useLocalization } from "../../hooks/useLocalization";


const ChatsPage: React.FC = () => {
  const t = useLocalization();
  return (
    <div className={styles.main}>
      <div className={styles.title}>{t("label.chats")}</div>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />{" "}
        </InputLeftElement>
        <Input type="text" placeholder="Search" />
      </InputGroup>
    </div>
  );
};

export default ChatsPage;
