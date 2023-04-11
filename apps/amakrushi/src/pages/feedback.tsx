import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import FeedbackPage from '../components/MorePage/FeedbackPage';

const feedback: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <FeedbackPage />
    </React.Fragment>
  );
};

export default feedback;
