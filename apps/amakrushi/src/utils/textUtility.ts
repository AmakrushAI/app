export const getInitialMsgs = (locale: (arg: string) => Record<string,any>) => {
  // const locale = localStorage.getItem("locale");
  return {
    payload: {
      buttonChoices: [
        {
          key: "1",
          text://@ts-ignore
            locale === "en"
              ? "What are the different types of millets grown in Odisha?"
              : "ଓଡିଶାରେ ବିଭିନ୍ନ ପ୍ରକାରର ମିଲେଟ୍ କ’ଣ ବ grown ିଥାଏ ?",
        },
        {
          key: "2",
          text: //@ts-ignore
            locale === "en"
              ? "Tell me something about treatment of termites in sugarcane?"
              : "ଆଖୁରେ ଟର୍ମାଇଟ୍ସର ଚିକିତ୍ସା ବିଷୟରେ ମୋତେ କିଛି କୁହନ୍ତୁ |",
        },
        {
          key: "3",
          text://@ts-ignore
            locale === "en"
              ? "How can farmers apply to government schemes in Odisha?"
              : "କୃଷକମାନେ ଓଡିଶାରେ ସରକାରୀ ଯୋଜନାରେ କିପରି ଆବେଦନ କରିପାରିବେ ?",
        },
      ],//@ts-ignore
      text: locale === "en" ? "Examples" : "ଉଦାହରଣ |",
    },
    position: "left",
    exampleOptions: true,
  };
};
