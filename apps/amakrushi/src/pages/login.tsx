import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import LoginPage from '../components/LoginPage/LoginPage';
import { useLocalization } from '../hooks';
import { useFlags } from 'flagsmith/react';


const Login: NextPage = () => {
  const t=useLocalization();

  const flags = useFlags(['show_app_loader']); // only causes re-render if specified flag values / traits change
  
  console.log({flags})
  return (
    <React.Fragment>
      <Head>
      <title>{t("title")}</title>
      </Head>
      <LoginPage />
    </React.Fragment>
  );
};

export default Login;
