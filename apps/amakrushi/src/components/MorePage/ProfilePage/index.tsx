import styles from './index.module.css';
import React, { useEffect, useState } from 'react';
import Menu from '../../menu';
//@ts-ignore
import { analytics } from '../../../utils/firebase';
import { logEvent } from 'firebase/analytics';
import { useFlags } from 'flagsmith/react';
import ComingSoonPage from '../../coming-soon-page';

const ProfilePage: React.FC = () => {
  const flags = useFlags(['show_profile_page']);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'Profile_page');
  }, []);

  if (!flags?.show_profile_page?.enabled) {
    return <ComingSoonPage />;
  } else
    return (
      <>
        <div className={styles.container}>
          <h1>Profile Page</h1>
        </div>
        {/* <Menu /> */}
      </>
    );
};

export default ProfilePage;
