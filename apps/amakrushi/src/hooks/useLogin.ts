import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

type User = {
  username: string;
  expiredAt: number;
  accessToken: string;
  avatar?: string;
  id: string;
};

export const useLogin = ( ) => {
  const [cookies, setCookies, removeCookies] = useCookies();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const login =useCallback(()=>{
    const token=cookies["access_token"];
    axios
    .get(`/api/auth?token=${token}`)
    .then((response) => {
      if (response.data === null) {
        toast.error("Invalid Access Token");
        setIsAuthenticated(false);
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated',isAuthenticated);
    }
    })
    .catch((err) => {
      //@ts-ignore
      logEvent(analytics, "console_error", {
        error_message: err.message,
      });
      setIsAuthenticated(false);
      router.push("/login");
    });
  },[cookies, router]);
  
  useEffect(() => {
    
    const decodedToken  = jwt.decode(cookies["access_token"]);
    //@ts-ignore
    const expires = new Date(decodedToken?.exp * 1000);
    // if token not expired then check for auth
    if (expires > new Date()) {
     login()
    } else {
      removeCookies("access_token", { path: "/" });
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
      if (typeof window !== "undefined") window.location.reload();
    }
  }, [cookies, login, removeCookies, router]);

  return {isAuthenticated,login};
};
