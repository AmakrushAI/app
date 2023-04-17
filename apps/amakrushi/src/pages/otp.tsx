import OTPpage from '../components/OTPpage';
import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';


const OTP: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("title")}</title>
      </Head>
      <OTPpage />
    </React.Fragment>
  );
};

export default OTP;
