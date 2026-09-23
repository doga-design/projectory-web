import { partnerPrograms } from '../../partnersData';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import styles from './PartnerPrograms.module.css';

const PartnerPrograms = () => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{partnerPrograms.eyebrow}</p>
        <h2 className={styles.title}>{partnerPrograms.title}</h2>
      </div>
      <div className={styles.cards}>
        {partnerPrograms.cards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
};

export default PartnerPrograms;
