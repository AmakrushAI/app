export const getInitialMsgs = (t:(arg0:string)=>string):any => {
  return {
    payload: {
      buttonChoices: [
        {
          key: "1",
          text: t("message.example_one")
        },
        {
          key: "2",
          text: t("message.example_two")
        },
        {
          key: "3",
          text: t("message.example_three")
        },
      ],
      text: t("label.examples"),
    },
    position: "left",
    exampleOptions: true,
  };
};
