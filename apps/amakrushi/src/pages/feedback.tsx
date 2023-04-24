import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import FeedbackPage from '../components/MorePage/FeedbackPage';
import { useLocalization } from '../hooks';



const Feedback: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <FeedbackPage />
    </React.Fragment>
  );
};

export default Feedback;
