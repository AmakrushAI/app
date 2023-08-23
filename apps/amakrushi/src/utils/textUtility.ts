export const getInitialMsgs = (t:(arg0:string)=>string):any => {
  return {
    payload: {
      buttonChoices: [
        {
          key: "1",
          text: t("message.example_one"),
          img: '/example_image_one.png'
        },
        {
          key: "2",
          text: t("message.example_two"),
          img: '/example_image_two.png'
        },
        {
          key: "3",
          text: t("message.example_three"),
          img: '/example_image_three.png'
        },
      ],
    },
    position: "left",
    exampleOptions: true,
  };
};
