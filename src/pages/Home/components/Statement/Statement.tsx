import { limeOlive, yellowCoral } from '@/assets/images/shapes/floaters';
import { statementLines } from '../../homeData';
import styles from './Statement.module.css';

const Statement = () => {
  return (
    <section className={styles.section}>
      <img src={yellowCoral} alt="" className={styles.shapeTop} aria-hidden />
      <div className={styles.copy}>
        {statementLines.map((line, i) => (
          <p
            key={line}
            className={`${styles.line}${i === statementLines.length - 1 ? ` ${styles.accent}` : ''}`}
          >
            {line}
          </p>
        ))}
      </div>
      <img src={limeOlive} alt="" className={styles.shapeBottom} aria-hidden />
    </section>
  );
};

export default Statement;
