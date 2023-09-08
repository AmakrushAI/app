import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import RegisterPage from '../components/RegisterPage';

const Register: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Ama Krushi AI Chatbot</title>
      </Head>
      <RegisterPage />
    </React.Fragment>
  );
};

export default Register;
