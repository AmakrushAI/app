import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import ChatsPage from '../components/ChatsPage';

const chats: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <ChatsPage />
    </React.Fragment>
  );
};

export default chats;
