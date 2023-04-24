import Menu from '../menu';
import styles from './index.module.css';
import Image from 'next/image';
import hourGlassIcon from '../../assets/icons/hourglass.svg';
import router from 'next/router';

function ComingSoonPage() {
  return (
    <div className={styles.container}>
      <span>Coming Soon!</span>
      <div className={styles.imageContainer}>
        <Image src={hourGlassIcon} alt="hourGlass" layout='responsive' />
      </div>
      <p className={styles.miniText}>
        We are going to launch this feature very soon. Stay tuned!
      </p>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => window.history.back()}>
        Back
      </button>
      <Menu />
    </div>
  );
}

export default ComingSoonPage;
