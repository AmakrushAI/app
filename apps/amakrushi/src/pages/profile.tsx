import ProfilePage from '../components/MorePage/ProfilePage';
import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useLocalization } from '../hooks';


const Profile: NextPage = () => {
  const t=useLocalization();
  return (
    <React.Fragment>
      <Head>
      <title>{t("label.title")}</title>
      </Head>
      <ProfilePage />
    </React.Fragment>
  );
};

export default Profile;
