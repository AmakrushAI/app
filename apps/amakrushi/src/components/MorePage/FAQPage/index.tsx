import { useEffect } from 'react';
import styles from './index.module.css';
import { Input, InputGroup, InputLeftElement, Select } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { NextPage } from 'next';
import Menu from '../../menu';

import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';

const MorePage: React.FC = () => {

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'FAQ_page');
  }, []);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.title}>FAQs</div>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />{' '}
          </InputLeftElement>
          <Input type="text" placeholder="Search" />
        </InputGroup>
        <div className={styles.user}>
          <Select placeholder="List item">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </div>
        <div className={styles.user}>
          <Select placeholder="List item">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </div>
        <div className={styles.user}>
          <Select placeholder="List item">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </div>
        <div className={styles.user}>
          <Select placeholder="List item">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </div>
        <div className={styles.title}>Dial 155333</div>
        <div className={styles.footer}>To connect with call centre</div>
      </div>
      <Menu />
    </>
  );
};

export default MorePage;
