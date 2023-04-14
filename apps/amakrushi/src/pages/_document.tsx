import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        {/* <ColorModeScript initialColorMode={theme.config.initialColorMode} /> */}
        <div id="modal_portal" />
        <Main />
        <NextScript />
      </body>

    </Html>
  );
}
