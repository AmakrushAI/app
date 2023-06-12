import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onMessageListener } from './firebase';

const FcmNotification = () => {
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    featureDetails: null,
  });

  const notify = () =>
    toast(<ToastDisplay />, {
      style: {
        backgroundColor: 'var(--primarygreen)',
        color: 'var(--tertiarygreen)',
      },
      duration: 7000,
    });

  function ToastDisplay() {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>
          <b>{notification?.title}</b>
        </p>
        <p>{notification?.body}</p>
        {notification?.featureDetails && (
          <div>
            <b>{notification.featureDetails.title}</b>
            <p>{notification.featureDetails.description}</p>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (notification.title) {
      notify();
    }
  }, [notification]);

  useEffect(() => {
    onMessageListener()
      .then((payload: any) => {
        const featureDetails = JSON.parse(
          payload.data?.['gcm.notification.featureDetails']
        );
        if (
          featureDetails?.description !== '' &&
          featureDetails?.title !== ''
        ) {
          setNotification({
            title: payload?.notification?.title,
            body: payload?.notification?.body,
            featureDetails,
          });
        } else {
          setNotification({
            title: payload?.notification?.title,
            body: payload?.notification?.body,
            featureDetails: null,
          });
        }
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  return <Toaster />;
};

export default FcmNotification;
