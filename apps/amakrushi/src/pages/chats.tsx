import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import ChatsPage from '../components/ChatsPage';
import { useLocalization } from '../hooks';

const Chats: NextPage = () => {
 const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <ChatsPage />
    </React.Fragment>
  );
};

export default Chats;
