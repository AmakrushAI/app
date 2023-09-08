import styles from './index.module.css';
import {
  Input,
  Stack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  const router = useRouter();
  const [adhaar, setAdhaar] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workmail, setWorkmail] = useState('');
  const [value, setValue] = React.useState('1');

  return (
    <div className={`${styles.main}`}>

      <div className={styles.title}>Ama Krushi AI Chatbot</div>

      <div className={styles.body}>
        <h1>Extension Worker</h1>
        <h3>Register Here</h3>

          <Stack spacing={5}>
          <Input
            height="5vh"
            padding="2vh 1.8vh"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={'Enter Adhaar Number'}
            focusBorderColor="var(--secondarygreen)"
            onChange={(e) => setAdhaar(e.target.value)}
            value={adhaar}
          />
          <Input
            height="5vh"
            padding="2vh 1.8vh"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={'Enter Your Name'}
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Input
            height="5vh"
            padding="2vh 1.8vh"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={'Enter Mobile No.'}
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
          <Input
            height="5vh"
            padding="2vh 1.8vh"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={'Enter Email ID'}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <Input
            height="5vh"
            padding="2vh 1.8vh"
            borderRadius="4px"
            border="2px solid"
            borderColor="var(--secondarygreen)"
            fontWeight="400"
            fontSize="14px"
            placeholder={'Enter Extension Worker ID'}
            onChange={(e) => setWorkmail(e.target.value)}
            value={workmail}
          />
          </Stack>
        <div style={{ display: 'flex', maxHeight: '10vh', alignItems: 'center' }}>
          <button
            className={styles.backButton}
            onClick={() => router.push('/login')}>
            Back
          </button>
          <button
            className={styles.submitButton}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
