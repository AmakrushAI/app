import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onMessageListener } from './firebase';

const FcmNotification = () => {
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    icon: '',
    featureDetails: null,
  });

  const notify = () =>
    toast(<ToastDisplay />, {
      style: {
        backgroundColor: 'var(--primarygreen)',
        color: 'var(--tertiarygreen)',
      },
      duration: 8000,
      icon: notification.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={notification.icon} alt="" width={50} height={50} />
      ) : null,
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
  }, [notification, notify]);

  onMessageListener()
    .then((payload: any) => {
      console.log('hello', payload);
      const featureDetails = JSON.parse(
        payload.data?.['gcm.notification.featureDetails']
      );
      if (featureDetails?.description !== '' && featureDetails?.title !== '') {
        setNotification({
          title: payload?.notification?.title,
          body: payload?.notification?.body,
          icon: payload?.notification?.image,
          featureDetails,
        });
      } else {
        setNotification({
          title: payload?.notification?.title,
          body: payload?.notification?.body,
          icon: payload?.notification?.image,
          featureDetails: null,
        });
      }
    })
    .catch((err) => console.log('failed: ', err));

  return <Toaster />;
};

export default FcmNotification;
