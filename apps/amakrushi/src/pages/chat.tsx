import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useLocalization } from '../hooks/useLocalization';
import Menu from '../components/menu';

const ChatUiWindow = dynamic(
  () => import('../components/PhoneView/ChatWindow/ChatUiWindow'),
  { ssr: false }
);

const Chat: NextPage = () => {
  const t = useLocalization();

  return (
    <>
      <Head>
        <title> {t('label.title')}</title>
      </Head>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: '7vh',
          top: '75px',
        }}>
        <ChatUiWindow />
      </div>
      <Menu />
    </>
  );
};
export default Chat;
