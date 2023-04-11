import styles from "./profile.module.css";
import avatar from "../../../public/avatar.jpg";
import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import React, { useState, useEffect, MouseEventHandler } from "react";
import ReactDom from "react-dom";
import Image from "next/image";

interface profileProps {
  toRemoveProfile: (name: string,number: string | null) => void;
  name: string;
  number: string | null;
  toHide: (e: React.MouseEvent) => void
  // userImg: string;
  show: boolean;
}

const Profile: React.FC<profileProps> = ({
  show, 
  toHide,
  name,
  number,
  toRemoveProfile,
}) => {
  const fontColor = useColorModeValue("white", "white");

  const onRemoveUser: React.MouseEventHandler = (event: React.MouseEvent) => {
    toRemoveProfile(name,number);
  }

  return show
    ? ReactDom.createPortal(
        <>
          <Box
            cursor="pointer"
            onClick={toHide}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundColor="rgba(0,0,0,0.8)"
            zIndex="1000"
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            zIndex="1000"
            transform="translate(-50%,-50%)"
          >
            <figure
              className={styles.container}
              style={{
                position: "relative",
                backgroundColor: "black",
                width: "315px",
              }}
            >
              <Image
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/331810/sample87.jpg"
                alt="coverPic"
                style={{
                  maxWidth: "100%",
                  opacity: "0.75",
                  verticalAlign: "top",
                }}
              />
              <figcaption
                style={{
                  width: "100%",
                  backgroundColor: "black",
                  padding: "25px",
                  position: "relative",
                  color: `${fontColor}`,
                }}
              >
                <Image
                  src="/avatar.jpg"
                  alt="profilePic"
                  style={{
                    borderRadius: "50%",
                    maxWidth: "90px",
                    zIndex: "1",
                    bottom: "100%",
                    left: "25px",
                    position: "absolute",
                    boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
                  }}
                />
                <h2
                  style={{
                    margin: "0 0 5px",
                  }}
                >
                  {name}
                  <span>User</span>
                </h2>
                <p>{}</p>
                <Flex justifyContent="end">
                  <Button onClick={onRemoveUser} size="xs" variant="solid" colorScheme="red">
                    Remove Profile
                  </Button>
                </Flex>
              </figcaption>
            </figure>
          </Box>
        </>,
        document.getElementById("modal_portal") as HTMLDivElement
      )
    : null;
};

export default Profile;
