import { limeOlive } from '@/assets/images/shapes/floaters';
import { statementLines } from '../../homeData';
import styles from './Statement.module.css';

const Statement = () => {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        {statementLines.map((line, i) => (
          <p
            key={line}
            className={`${styles.line}${i === statementLines.length - 1 ? ` ${styles.accent}` : ''}`}
          >
            {line}
          </p>
        ))}
        <img src={limeOlive} alt="" className={styles.shape} aria-hidden />
      </div>
    </section>
  );
};

export default Statement;
