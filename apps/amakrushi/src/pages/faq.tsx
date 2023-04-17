import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import FAQPage from '../components/MorePage/FAQPage';

import { useLocalization } from '../hooks';

const Faq: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("title")}</title>
      </Head>
      <FAQPage />
    </React.Fragment>
  );
};

export default Faq;
