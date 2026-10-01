import type { ReactNode } from 'react';
import styles from './MutedNote.module.css';

interface MutedNoteProps {
  children: ReactNode;
  className?: string;
}

/** Small dim footnote centred under a row of cards (pricing, partner programs). */
const MutedNote = ({ children, className }: MutedNoteProps) => (
  <p className={className ? `${styles.note} ${className}` : styles.note}>{children}</p>
);

export default MutedNote;
