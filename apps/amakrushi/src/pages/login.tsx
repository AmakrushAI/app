import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import LoginPage from '../components/LoginPage/LoginPage';

const login: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <LoginPage />
    </React.Fragment>
  );
};

export default login;
