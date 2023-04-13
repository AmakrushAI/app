import styles from './login.module.css';
import {
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useCookies } from 'react-cookie';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [value, setValue] = React.useState('1');
  const[cookie] = useCookies();

  // Setting the input value
  const handleNumber: React.ChangeEventHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInput(e.target.value);
  };

  const handleOTPPage: React.MouseEventHandler = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (input.length !== 10) {
      alert('Enter a 10 digit number!');
    } else {
      fetch(
        // `${process.env.NEXT_PUBLIC_OTP_BASE_URL}uci/sendOTP?phone=${input}`,
        `https://user-service.chakshu-rd.samagra.io/uci/sendOTP?phone=${input}`,
        { method: 'GET' }
      ).then((response) => {
        if (response.status === 200) {
          router.push({ pathname: '/otp', query: { state: input } });
        } else {
          alert('OTP not sent');
        }
      });
    }
  };

  return (
    <div className={`${styles.main}`}>
      <div className={styles.title}>Ama KrushAI</div>

      <div className={styles.body}>
        <h1>Welcome</h1>

        <RadioGroup onChange={setValue} value={value}>
          <Radio value="1">Farmer</Radio>
          <Radio value="2" style={{ marginLeft: '50px' }}>
            Extension Worker
          </Radio>
        </RadioGroup>

        <NumberInput style={{ margin: '5vh auto 0px auto' }}>
          <NumberInputField
            height="45px"
            padding="18px 16px"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={
              value === '1' ? 'Enter adhaar number' : 'Enter phone number'
            }
            value={input}
            onChange={handleNumber}
          />
        </NumberInput>
        <div
          style={{
            margin: '3vh auto 0 auto',
            fontSize: '18px',
            color: 'var(--font)',
          }}>
          If you are already registered then use your adhaar number to login.
        </div>
        <button className={styles.submitButton} onClick={handleOTPPage}>
          Continue
        </button>
        <div className={styles.signup}>
          <div>Not registered yet ?</div>
          <div
            onClick={() => router.push('/register')}
            style={{
              color: 'var(--secondarygreen)',
            }}>
            Register at Krushak Odisha
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
