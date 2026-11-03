import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/Button/Button';
import FloatingShapes from '@/components/FloatingShapes/FloatingShapes';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import styles from './ShapeCta.module.css';

interface ShapeCtaProps {
  title: string;
  body: string;
  cta: { label: string; to: string };
}

/** A full-screen closing call to action, with brand shapes closing in around it on scroll. */
const ShapeCta = ({ title, body, cta }: ShapeCtaProps) => {
  const reducedMotion = useReducedMotion();
  // Only the shared fade and timing: no key, as this plays on scroll rather than once a session.
  const { fade, transition } = usePageEntrance('');

  return (
    <section className={styles.section}>
      <FloatingShapes motionType="arrive" solidShapes />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        {/* Fades in the first time it's well into view, then stays. */}
        <motion.div
          className={styles.cta}
          initial={reducedMotion ? false : fade.initial}
          whileInView={fade.animate}
          viewport={{ once: true, amount: 1, margin: '0px 0px -12% 0px' }}
          transition={transition()}
        >
          <Button variant="coral" size="small" to={cta.to}>
            {cta.label}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ShapeCta;
