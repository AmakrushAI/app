import { useCallback, useEffect, useState } from 'react';
import styles from './index.module.css';
import { Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import searchIcon from '../../../assets/icons/search.svg';
import callIcon from '../../../assets/icons/call-icon.svg';
import Image from 'next/image';
import Menu from '../../menu';
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { useFlags } from 'flagsmith/react';
import ComingSoonPage from '../../coming-soon-page';
import axios from 'axios';
import { useLocalization } from '../../../hooks';

const FAQPage: React.FC = () => {
  const t = useLocalization();
  const flags = useFlags([
    'show_faq_page',
    'show_dialer',
    'dialer_number',
    'show_pdf_buttons',
    'odia_pdf_link',
    'eng_pdf_link',
  ]);
  const [faqData, setFaqData] = useState<any[]>([]);
  console.log(flags);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'FAQ_page');

    const fetchData = async () => {
      let page = 1;
      let allData: any[] = [];

      while (true) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/faq?page=${page}`
          );
          const newData = response.data.faqs;

          if (!newData.length) {
            break; // no more data, exit loop
          }

          allData = [...allData, ...newData];
          page++;
        } catch (error) {
          console.log(error);
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: error.message,
          });
          break;
        }
      }
      setFaqData(allData);
    };

    fetchData();
  }, []);

  const downloadPDFHandler = useCallback(
    (filename: any, language: any) => {
      const link = flags?.[`${language}_pdf_link`]?.value;
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

      window.open(link);

      fetch(proxyUrl + link, {
        method: 'GET',
        headers: {},
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${filename}.pdf`;

          document.body.appendChild(a);
          a.click();

          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch((error) => {
          console.error(error);
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: error.message,
          });
        });
    },
    [flags]
  );

  if (!flags?.show_faq_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.main}>
          <div className={styles.title}>{t('label.faqs')}</div>
          {/* <InputGroup pb={2}>
            <InputLeftElement pointerEvents="none">
              <Image src={searchIcon} alt="" width={20} height={20} />
            </InputLeftElement>
            <Input type="text" placeholder={t('label.search')} />
          </InputGroup> */}
          <Accordion allowMultiple>
            {faqData.map((faq, idx) => (
              <AccordionItem key={idx}>
                <h2>
                  <AccordionButton fontSize={'1.89vh'}>
                    <Box as="span" flex="1" textAlign="left">
                      {localStorage.getItem('locale') === 'or'
                        ? faq.question
                        : faq.questionInEnglish}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} fontSize={'1.89vh'}>
                  {localStorage.getItem('locale') === 'or'
                    ? faq.answer
                    : faq.answerInEnglish}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <section className={styles.bottomSection}>
            {flags?.show_pdf_buttons?.enabled && (
              <div className={styles.manualButtons}>
                <button
                  onClick={() => downloadPDFHandler('my_eng_manual', 'eng')}
                  className={styles.submitButton}>
                  User Manual - &nbsp; English
                </button>
                <button
                  onClick={() => downloadPDFHandler('my_odia_manual', 'odia')}
                  className={styles.submitButton}>
                  ବ୍ୟବହାରକାରୀ ମାନୁଆଲ - &nbsp; ଓଡିଆ
                </button>
              </div>
            )}
            {flags?.show_dialer?.enabled && (
              <div className={styles.dialerBox}>
                <div className={styles.footer}>
                  {t('message.dial_description')}
                </div>
                <a href="tel:155333" className={styles.footerTitle}>
                  <div className={styles.callIconBox}>
                    <Image src={callIcon} alt="callIcon" layout="responsive" />
                  </div>
                  {t('label.dial')} {flags.dialer_number.value}
                </a>
              </div>
            )}
          </section>
        </div>
        <Menu />
      </>
    );
};

export default FAQPage;
