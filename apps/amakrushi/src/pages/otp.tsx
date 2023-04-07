import OTPpage from '../components/OTPpage';
import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

const OTP: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama KrushAI</title>
      </Head>
      <OTPpage />
    </React.Fragment>
  );
};

export default OTP;
