import { Box, HStack, PinInputField, PinInput } from "@chakra-ui/react";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { NextRouter, useRouter } from "next/router";
import { useCookies } from "react-cookie";
import styles from "./OTP.module.css";
import { useLocalization } from "../../hooks";
import { logEvent, setUserId } from "firebase/analytics";
import { analytics } from "../../utils/firebase";
import toast from "react-hot-toast";
import axios from "axios";
import { FormattedMessage } from "react-intl";
import { AppContext } from "../../context";
import jwt_decode from "jwt-decode";

const OTPpage: React.FC = () => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const router: NextRouter = useRouter();
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [input4, setInput4] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownIntervalId, setCountdownIntervalId] = useState<any>(null);
  console.log("vbn:", { context });

  const handleOTPSubmit: React.FormEventHandler = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    
   
    const inputOTP: string = input1 + input2 + input3 + input4;
    if (inputOTP.length === 4) {
      fetch(
        `${process.env.NEXT_PUBLIC_OTP_BASE_URL}api/login/otp`,
        {
          method: "POST",
          body: JSON.stringify({
            loginId: router.query.state,
            password: inputOTP,
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            applicationId: process.env.NEXT_PUBLIC_USER_SERVICE_APP_ID,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("token:", { data });
          if (data.params.status === "Success") {
            let expires = new Date();
            expires.setTime(
              expires.getTime() +
                data.result.data.user.tokenExpirationInstant * 1000
            );
            removeCookie("access_token");
            setCookie("access_token", data.result.data.user.token, {
              path: "/",
              expires,
            });
            const phoneNumber = router.query.state;
            // @ts-ignore
            localStorage.setItem("phoneNumber", phoneNumber);
            const decodedToken=jwt_decode(data.result.data.user.token);
            //@ts-ignore
            localStorage.setItem("userID", decodedToken?.sub);
            localStorage.setItem("auth", data.result.data.user.token);
            // @ts-ignore
            setUserId(analytics, localStorage.getItem("userID"));

            context?.setIsMobileAvailable(true);
            setTimeout(() => {
              router.push("/");
            }, 10);
        
          } else {
            toast.error(`${t("message.invalid_otp")}`);
          }
        })
        .catch((err) => {
          console.log(err)
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: err.message,
          });
        }
        );
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

  const resendOTP = useCallback(async () => {
    if (isResendingOTP) {
      toast.error(`${t("message.wait_resending_otp")}`);
      return;
    }

    setIsResendingOTP(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_OTP_BASE_URL}api/sendOTP?phone=${router.query.state}`
      );
      if (response.status === 200) {
        toast.success(`${t("message.otp_sent_again")}`);

        setCountdown(30);

        const countdownIntervalId = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
        setCountdownIntervalId(countdownIntervalId);

        setTimeout(() => {
          setIsResendingOTP(false);
          clearInterval(countdownIntervalId);
          setCountdownIntervalId(null);
        }, 30000);
      } else {
        toast.error(`${t("error.otp_not_sent")}`);
      }
    } catch (error) {
      toast.error(`${t("error.error.sending_otp")}`);
      //@ts-ignore
      logEvent(analytics, 'console_error', {
        error_message: error.message,
      });
    }

    return () => {
      if (countdownIntervalId !== null) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [isResendingOTP, router.query.state, countdownIntervalId, t]);

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, "OTP_page");
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.title}>{t("label.title")}</div>
      <Box
        backgroundColor="var(--bg-color) !important"
        width="340px"
        height="80vh"
        display="flex"
        background={"white"}
        flexDirection="column"
        justifyContent="space-between"
        borderRadius={"5"}
        margin={"auto"}
      >
        <Box
          padding={1}
          textAlign="center"
          color="black"
          px="1rem"
          marginTop="10vh"
        >
          <div className={styles.otpVerify}>
            {t("message.otp_verification")}
          </div>

          <div className={styles.otpSent}>
            {t("message.otp_message")} <b> {t("label.mobile_number")}</b>
          </div>
          <div style={{ marginTop: "10px" }}>
            <b>+91-{router.query.state}</b>
          </div>
          <form onSubmit={handleOTPSubmit}>
            <HStack style={{ marginTop: "34px", justifyContent: "center" }}>
              <PinInput otp placeholder="">
                <PinInputField
                  className={styles.pinInputField}
                  value={input1}
                  onChange={handleOTP1}
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input2}
                  onChange={handleOTP2}
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input3}
                  onChange={handleOTP3}
                />
                <PinInputField
                  className={styles.pinInputField}
                  value={input4}
                  onChange={handleOTP4}
                />
              </PinInput>
            </HStack>

            <div className={styles.resendOTP}>
              {countdown > 0 ? (
                <span>
                  <FormattedMessage
                    id="message.wait_minutes"
                    defaultMessage="Please wait {countdown} seconds before resending OTP"
                    values={{ countdown }}
                  />
                </span>
              ) : (
                <>
                  <span>{t("message.didnt_receive")} &nbsp;</span>
                  <p onClick={resendOTP}>{t("message.resend_again")}</p>
                </>
              )}
            </div>

            <div style={{ display: "flex" }}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.push("/login")}
              >
                {t("label.back")}
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                onClick={handleOTPSubmit}
              >
                {t("label.submit")}
              </button>
            </div>
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