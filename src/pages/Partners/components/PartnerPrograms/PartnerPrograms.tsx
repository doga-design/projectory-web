import { useState } from 'react';
import { partnerPrograms, sectionIds, type PartnerProgram } from '../../partnersData';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import ApplyFormOverlay from '../ApplyFormOverlay/ApplyFormOverlay';
import styles from './PartnerPrograms.module.css';

const PartnerPrograms = () => {
  const [program, setProgram] = useState<PartnerProgram | null>(null);

  return (
    <section id={sectionIds.programs} className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{partnerPrograms.eyebrow}</p>
        <h2 className={styles.title}>{partnerPrograms.title}</h2>
      </div>
      <div className={styles.cards}>
        {partnerPrograms.cards.map((card) => (
          <FeatureCard
            key={card.title}
            {...card}
            cta={{ label: 'Apply', onClick: () => setProgram(card.title) }}
          />
        ))}
      </div>

      <ApplyFormOverlay program={program} onClose={() => setProgram(null)} />
    </section>
  );
};

export default PartnerPrograms;
