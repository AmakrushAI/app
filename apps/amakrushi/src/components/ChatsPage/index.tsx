import styles from './index.module.css';
import React from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';


const ChatsPage: React.FC = () => {
  return (
    <div className={styles.main}>
      <div className={styles.title}>Chats</div>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<SearchIcon color="gray.300" />}
        />
        <Input type="text" placeholder="Search" />
      </InputGroup>
    </div>
  );
};

export default ChatsPage;
