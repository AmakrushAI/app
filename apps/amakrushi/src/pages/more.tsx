import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import MorePage from '../components/MorePage';

const more: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <MorePage />
    </React.Fragment>
  );
};

export default more;
