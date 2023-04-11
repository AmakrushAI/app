import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import FAQPage from '../components/MorePage/FAQPage';

const faq: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <FAQPage />
    </React.Fragment>
  );
};

export default faq;
