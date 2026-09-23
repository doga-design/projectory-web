import Button from '@/components/Button/Button';
import styles from './FeatureCard.module.css';

export interface FeatureCardProps {
  accent: 'coral' | 'teal' | 'lime';
  title: string;
  /** Muted line under the title. */
  caption?: string;
  body: string;
  features: readonly string[];
  cta: { label: string; to: string };
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    className={styles.checkIcon}
    aria-hidden
  >
    <path
      d="M9.49805 19C14.7449 19 18.998 14.7468 18.998 9.5C18.998 4.25315 14.7449 0 9.49805 0C4.2512 0 -0.00195312 4.25315 -0.00195312 9.5C-0.00195312 14.7468 4.2512 19 9.49805 19Z"
      fill="white"
    />
    <path
      d="M5.19727 10.1143L7.65398 12.571L13.7958 6.4292"
      stroke="#1C1C1C"
      strokeWidth="1.66102"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FeatureCard = ({ accent, title, caption, body, features, cta }: FeatureCardProps) => {
  return (
    <article className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {caption && <p className={styles.caption}>{caption}</p>}
        </div>
        <p className={styles.body}>{body}</p>
        <div className={styles.divider} />
        <ul className={styles.featureList}>
          {features.map((feature) => (
            <li key={feature} className={styles.featureItem}>
              <CheckIcon />
              <span className={styles.featureText}>{feature}</span>
            </li>
          ))}
        </ul>
        <Button variant="light" to={cta.to} className={styles.cta}>
          {cta.label}
        </Button>
      </div>
    </article>
  );
};

export default FeatureCard;
