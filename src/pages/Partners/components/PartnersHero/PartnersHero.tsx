import { motion } from 'framer-motion';
import { partnersHero, clientLogos } from '../../partnersData';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import Button from '@/components/Button/Button';
import LogoMarquee from '@/components/LogoMarquee/LogoMarquee';
import styles from './PartnersHero.module.css';

type Entrance = ReturnType<typeof usePageEntrance>;

interface PartnersHeroProps {
  entrance: Entrance;
}

const PartnersHero = ({ entrance }: PartnersHeroProps) => {
  const initial = entrance.play ? entrance.fade.initial : false;

  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <motion.h1
          className={styles.title}
          initial={initial}
          animate={entrance.fade.animate}
          transition={entrance.transition(0)}
        >
          {partnersHero.title}
        </motion.h1>
        <motion.p
          className={styles.body}
          initial={initial}
          animate={entrance.fade.animate}
          transition={entrance.transition(0.12)}
        >
          {partnersHero.body}
        </motion.p>
        <motion.div
          className={styles.cta}
          initial={initial}
          animate={entrance.fade.animate}
          transition={entrance.transition(0.24)}
        >
          <Button variant="lime" to={partnersHero.cta.to}>
            {partnersHero.cta.label}
          </Button>
        </motion.div>
      </div>
      <motion.div
        initial={initial}
        animate={entrance.fade.animate}
        transition={entrance.transition(0.36)}
      >
        <LogoMarquee logos={clientLogos} />
      </motion.div>
    </section>
  );
};

export default PartnersHero;
