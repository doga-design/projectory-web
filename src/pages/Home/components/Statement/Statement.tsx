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
      </div>
    </section>
  );
};

export default Statement;
