import Menu from '../menu';
import styles from './index.module.css';

function ComingSoonPage() {
  return (
    <div className={`${styles.container}`}>
      <span>Coming Soon...</span>
      <Menu/>
    </div>
  )
}

export default ComingSoonPage