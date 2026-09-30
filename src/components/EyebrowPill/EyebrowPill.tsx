import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import styles from './EyebrowPill.module.css';

type EyebrowPillProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  children: ReactNode;
};

/** Pill eyebrow above hero titles. Takes motion props so it can join a page's entrance. */
const EyebrowPill = ({ children, className, ...motionProps }: EyebrowPillProps) => (
  <motion.span
    {...motionProps}
    className={className ? `${styles.pill} ${className}` : styles.pill}
  >
    <span className={styles.label}>{children}</span>
  </motion.span>
);

export default EyebrowPill;
