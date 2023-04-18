import {
  Box,
  HStack,
  PinInputField,
  PinInput
} from '@chakra-ui/react';
import React, { useState, useEffect} from 'react';
import { NextRouter, useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import styles from './OTP.module.css';
import { useLocalization } from '../../hooks';
import { logEvent } from 'firebase/analytics'
import { analytics } from '../../utils/firebase';
import toast from 'react-hot-toast';

const OTPpage: React.FC = () => {
  const t=useLocalization();
  const router: NextRouter = useRouter();
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);

  const handleOTPSubmit: React.FormEventHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const inputOTP: string = input1 + input2 + input3 + input4;
    if (inputOTP.length === 4) {
      fetch(
        `https://user-service.chakshu-rd.samagra.io/uci/loginOrRegister?phone=${router.query.state}&otp=${inputOTP}`,
        {
          method: 'get',
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.resp.params.status === 'Success') {
            let expires = new Date();
            expires.setTime(
              expires.getTime() +
                data.resp.result.data.user.tokenExpirationInstant * 1000
            );
            removeCookie('access_token');
            setCookie('access_token', data.resp.result.data.user.token, {
              path: '/',
              expires,
            });
            const phoneNumber = router.query.state;
            // @ts-ignore
            localStorage.setItem('phoneNumber', phoneNumber);
            //@ts-ignore
            setUserId(analytics, phoneNumber);
            router.push('/');
          } else {
            toast.error('Incorrect OTP');
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleOTP1: React.ChangeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput1(e.target.value);
  };
  const handleOTP2: React.ChangeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput2(e.target.value);
  };
  const handleOTP3: React.ChangeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput3(e.target.value);
  };
  const handleOTP4: React.ChangeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput4(e.target.value);
  };

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, 'OTP_page');
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.title}>{t("title")}</div>
      <Box
        backgroundColor="var(--bg-color) !important"
        width="340px"
        height="80vh"
        display="flex"
        background={'white'}
        flexDirection="column"
        justifyContent="space-between"
        borderRadius={'5'}
        margin={'auto'}>
        <Box
          padding={1}
          textAlign="center"
          color="black"
          px="1rem"
          marginTop="10vh">
          <div className={styles.otpVerify}>
           
            {t("message.otp_verification")}
            </div>

          <div className={styles.otpSent}>
          {t("message.otp_message")}   <b> {t("label.mobile_number")}</b>
          </div>
          <div style={{ marginTop: '10px' }}>
            <b>+91-{router.query.state}</b>
          </div>
          <form onSubmit={handleOTPSubmit}>
            <>
            <HStack style={{ marginTop: '34px', justifyContent: 'center' }}>
              <PinInput otp placeholder="">
                <PinInputField
                  className={styles.pinInputField}
                  value={input1}
                  onChange={handleOTP1}
                  boxShadow="0 2.8px 2.2px rgba(0, 0, 0, 0.034),
                0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06),
                0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086),
                0 100px 80px rgba(0, 0, 0, 0.12);"
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input2}
                  onChange={handleOTP2}
                  boxShadow="0 2.8px 2.2px rgba(0, 0, 0, 0.034),
                0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06),
                0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086),
                0 100px 80px rgba(0, 0, 0, 0.12);"
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input3}
                  onChange={handleOTP3}
                  boxShadow="0 2.8px 2.2px rgba(0, 0, 0, 0.034),
                0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06),
                0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086),
                0 100px 80px rgba(0, 0, 0, 0.12);"
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input4}
                  onChange={handleOTP4}
                  boxShadow="0 2.8px 2.2px rgba(0, 0, 0, 0.034),
                0 6.7px 5.3px rgba(0, 0, 0, 0.048), 0 12.5px 10px rgba(0, 0, 0, 0.06),
                0 22.3px 17.9px rgba(0, 0, 0, 0.072), 0 41.8px 33.4px rgba(0, 0, 0, 0.086),
                0 100px 80px rgba(0, 0, 0, 0.12);"
              />
            </PinInput>
          </HStack>
          <div style={{ display: 'flex' }}>
            <button
              className={styles.backButton}
              onClick={() => router.push('/login')}>
              {t('label.back')}
            </button>
            <button className={styles.submitButton} onClick={handleOTPSubmit}>
              {t(('label.submit'))}
            </button>
          </div>
          </>
          </form>
        </Box>
        {/* <Box>
          <div className={styles.login}>
            You have an account?{' '}
            <b>
              <Link
                href="/login"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}>
                Login
              </Link>
            </b>
          </div>
        </Box> */}
      </Box>
    </div>
  );
};

export default OTPpage;
