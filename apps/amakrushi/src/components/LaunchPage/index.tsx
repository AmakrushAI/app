import styles from './index.module.css';
import KrushakOdisha from "../../assets/images/krushak_odisha.png";
import Image from "next/image";

function LaunchPage() {
  return (
    <div className={`${styles.container}`}>
      <Image
              className={styles.loginImage}
              src={KrushakOdisha}
              alt="KrushakOdisha"
              width={220}
              height={233}
            />
            <span>Ama KrushAI</span>
    </div>
  )
}

export default LaunchPage