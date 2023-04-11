/* eslint-disable @next/next/inline-script-id */
import { ColorModeScript } from '@chakra-ui/react';
import { Html, Head, Main, NextScript } from 'next/document';
// import theme from '../components/ColorModeSwitcher/theme';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang='zh-hk'>
      <Head />
      <body>
        {/* <ColorModeScript initialColorMode={theme.config.initialColorMode} /> */}
        <div id="modal_portal" />
        <Main />
        <NextScript />
      </body>

      <Script        
        type="text/javascript"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit">          
        {/* {(function googleTranslateElementInit() {
          new window.google.translate.TranslateElement(
            { pageLanguage: "zh-hk" },
            "google_translate_element"
          );
          return null;
        })()} */}
        </Script>
    </Html>
  );
}
