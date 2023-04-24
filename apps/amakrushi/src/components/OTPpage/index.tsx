import { Box, HStack, PinInputField, PinInput } from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { NextRouter, useRouter } from "next/router";
import { useCookies } from "react-cookie";
import styles from "./OTP.module.css";
import { useLocalization } from "../../hooks";
import { logEvent, setUserId } from "firebase/analytics";
import { analytics } from "../../utils/firebase";
import toast from "react-hot-toast";
import axios from "axios";
import { FormattedMessage } from "react-intl";

const OTPpage: React.FC = () => {
  const t = useLocalization();
  const router: NextRouter = useRouter();
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [input4, setInput4] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleOTPSubmit: React.FormEventHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const inputOTP: string = input1 + input2 + input3 + input4;
    if (inputOTP.length === 4) {
      fetch(
        `${process.env.NEXT_PUBLIC_OTP_BASE_URL}uci/loginOrRegister?phone=${router.query.state}&otp=${inputOTP}`,
        {
          method: "get",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.resp.params.status === "Success") {
            let expires = new Date();
            expires.setTime(
              expires.getTime() +
                data.resp.result.data.user.tokenExpirationInstant * 1000
            );
            removeCookie("access_token");
            setCookie("access_token", data.resp.result.data.user.token, {
              path: "/",
              expires,
            });
            const phoneNumber = router.query.state;
            // @ts-ignore
            localStorage.setItem("phoneNumber", phoneNumber);
            // @ts-ignore
            setUserId(analytics, phoneNumber);
            router.push("/");
            localStorage.setItem("auth", data.resp.result.data.user.token);
          } else {
            toast.error("Incorrect OTP");
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

  const resendOTP = useCallback(() => {
    if (isResendingOTP) {
      toast.error("Please wait before resending OTP");
      return;
    }

    setIsResendingOTP(true);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_OTP_BASE_URL}uci/sendOTP?phone=${router.query.state}`
      )
      .then((response) => {
        if (response.status === 200) {
          toast.success("OTP sent again");

          setCountdown(30);

          const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
          }, 1000);

          setTimeout(() => {
            setIsResendingOTP(false);
          }, 30000);
        } else {
          toast.error("OTP not sent");
        }
      })
      .catch((error) => {
        toast.error("Error sending OTP");
      });
  }, [isResendingOTP, router.query.state]);

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
                  values={{countdown}}
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
