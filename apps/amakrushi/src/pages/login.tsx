import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import LoginPage from '../components/LoginPage/LoginPage';
import { useLocalization } from '../hooks';

const Login: NextPage = () => {
  const t=useLocalization();

  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <LoginPage />
    </React.Fragment>
  );
};

export default Login;
