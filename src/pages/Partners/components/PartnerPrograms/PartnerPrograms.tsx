import { useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerPrograms, sectionIds, type PartnerProgram } from '../../partnersData';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import MutedNote from '@/components/MutedNote/MutedNote';
import ApplyFormOverlay from '../ApplyFormOverlay/ApplyFormOverlay';
import styles from './PartnerPrograms.module.css';

const PartnerPrograms = () => {
  const [program, setProgram] = useState<PartnerProgram | null>(null);
  const { note } = partnerPrograms;

  return (
    <section id={sectionIds.programs} className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{partnerPrograms.eyebrow}</p>
        <h2 className={styles.title}>{partnerPrograms.title}</h2>
      </div>
      <div className={styles.body}>
        <div className={styles.cards}>
          {partnerPrograms.cards.map((card) => (
            <FeatureCard
              key={card.title}
              {...card}
              cta={{ label: 'Learn more', onClick: () => setProgram(card.title) }}
            />
          ))}
        </div>
        <MutedNote>
          {note.lines[0]}
          <br />
          {note.lines[1]} <Link to={note.link.to}>{note.link.label}</Link>.
        </MutedNote>
      </div>

      <ApplyFormOverlay program={program} onClose={() => setProgram(null)} />
    </section>
  );
};

export default PartnerPrograms;
