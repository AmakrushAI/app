import styles from "./login.module.css";
import { NumberInput, NumberInputField, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLocalization } from "../../hooks/useLocalization";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../utils/firebase";
import toast from "react-hot-toast";
const LoginPage: React.FC = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = React.useState("2");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const t = useLocalization();
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
      toast.error(`${t("message.invalid_mobile")}`);
    } else {
      setIsButtonDisabled(true);
      if (navigator.onLine) {
        setLoading(true);
        fetch(
          // `${process.env.NEXT_PUBLIC_OTP_BASE_URL}uci/sendOTP?phone=${input}`,
          `${process.env.NEXT_PUBLIC_OTP_BASE_URL}api/sendOTP?phone=${input}`,
          { method: "GET" }
        )
          .then((response) => {
            setLoading(false);
            if (response.status === 200) {
              // localStorage.setItem('phoneNumber',input)
              router.push({ pathname: "/otp", query: { state: input } });
            } else {
              setIsButtonDisabled(false);
              toast.error(`${t("message.otp_not_sent")}`);
            }
          })
          .catch((err) => {
            setLoading(false);
            toast.error(err.message);
          });
      } else {
        toast.error(`${t("label.no_internet")}`)
      }
    }
  };

  useEffect(() => {
    //@ts-ignore
    logEvent(analytics, "Login_page");
  }, []);

  return (
    <div className={`${styles.main}`}>
      <div className={styles.title}>{t("label.title")}</div>

      <div className={styles.body}>
        {/* <h1>{t("label.welcome")}</h1> */}

        {/* <RadioGroup onChange={setValue} value={value}>
          <Radio value="1">{t("label.farmer")}</Radio>
          <Radio value="2" style={{ marginLeft: "50px" }}>
            {t("label.extension_worker")}
          </Radio>
        </RadioGroup>  */}

        <form onSubmit={(event) => event?.preventDefault()}>
          <div className={styles.container}>
            <NumberInput style={{ margin: "5vh auto 0px auto", width: "100%" }}>
              <NumberInputField
                height="45px"
                padding="18px 16px"
                borderRadius="4px"
                border="2px solid"
                borderColor="var(--secondarygreen)"
                fontWeight="400"
                fontSize="14px"
                placeholder={
                  value === "1"
                    ? "Enter adhaar number"
                    : t("message.enter_mobile")
                }
                value={input}
                onChange={handleNumber}
              />
            </NumberInput>
            {/* <div
          style={{
            margin: "3vh auto 0 auto",
            fontSize: "18px",
            color: "var(--font)",
          }}
        >
          {t("message.register_message")}
        </div> */}
            {loading ? (
              <button className={styles.submitButton}>
                <Spinner />
              </button>
            ) : (
              <button
                className={styles.submitButton}
                onClick={handleOTPPage}
                disabled={isButtonDisabled}
              >
                {t("label.continue")}
              </button>
            )}
          </div>
        </form>
        {/* <div className={styles.signup}>
          <div>{t("message.not_register_yet")}</div>
          <div
            onClick={() => router.push("/register")}
            style={{
              color: "var(--secondarygreen)",
            }}
          >
            {t("message.register_at_krushak")}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
