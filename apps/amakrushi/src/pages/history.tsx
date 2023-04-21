import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import HistoryPage from '../components/HistoryPage';
import { useLocalization } from '../hooks';

const History: NextPage = () => {
 const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <HistoryPage />
    </React.Fragment>
  );
};

export default History;
