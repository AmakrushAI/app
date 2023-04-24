import { useEffect, useState } from 'react';
import styles from './index.module.css';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import searchIcon from '../../../assets/icons/search.svg';
import Image from 'next/image';
import Menu from '../../menu';
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { useFlags } from 'flagsmith/react';
import ComingSoonPage from '../../coming-soon-page';
import axios from 'axios';

const MorePage: React.FC = () => {
  const flags = useFlags(['show_faq_page']);
  const [faqData, setFaqData] = useState([]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'FAQ_page');

    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/faq`)
      .then((response) => {
        console.log('here', response.data);
        setFaqData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (!flags?.show_faq_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>FAQs</div>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Image src={searchIcon} alt="" width={20} height={20} />
            </InputLeftElement>
            <Input type="text" placeholder="Search" />
          </InputGroup>
          <Accordion defaultIndex={[0]} allowMultiple>
            {faqData.map((faq, idx) => (
              <AccordionItem key={idx} className={styles.accordionItem}>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <section className={styles.bottomSection}>
            <div className={styles.manualButtons}>
              <button className={styles.submitButton}>
                User Manual - &nbsp;{' '}
                <span className={styles.langName}>English</span>
              </button>
              <button className={styles.submitButton}>
                User Manual - &nbsp;{' '}
                <span className={styles.langName}>Odia</span>
              </button>
            </div>
            <div className={styles.footerTitle}>Dial 155333</div>
            <div className={styles.footer}>To connect with call centre</div>
          </section>
        </div>
        <Menu />
      </>
    );
};

export default MorePage;
