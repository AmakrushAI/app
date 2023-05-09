import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { analytics } from '../utils/firebase';
import { logEvent } from 'firebase/analytics';

type User = {
  username: string;
  expiredAt: number;
  accessToken: string;
  avatar?: string;
  id: string;
};

export const useLogin = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const login = useCallback(() => {
    // No need to check for auth if access token is not present
    if (cookies.access_token) {
      const decodedToken = jwt.decode(cookies.access_token);
      const expires = new Date(decodedToken?.exp * 1000);
      // if token not expired then check for auth
      if (expires > new Date()) {
        const token = cookies.access_token;
        axios
          .get(`/api/auth?token=${token}`)
          .then((response) => {
            if (response.data === null) {
              toast.error('Invalid Access Token');
              router.push('/login');
              console.log('response null');
            } else {
              setIsAuthenticated(true);
              console.log('authenticated true');
            }
          })
          .catch((err) => {
            //@ts-ignore
            logEvent(analytics, 'console_error', {
              error_message: err.message,
            });
            router.push('/login');
            console.log('catch err');
          });
      } else {
        removeCookie('access_token', { path: '/' });
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
        if (typeof window !== 'undefined') window.location.reload();
      }
    }
  }, [cookies.access_token, removeCookie, router]);

  return { isAuthenticated, login };
};
