import type { Logo } from '@/components/LogoMarquee/LogoMarquee';
import styles from './LogoGrid.module.css';

interface LogoGridProps {
  title: string;
  logos: readonly Logo[];
}

/** A centred title over client logos in solid tiles that wrap into rows. */
const LogoGrid = ({ title, logos }: LogoGridProps) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.tiles}>
        {logos.map((logo) => (
          <li key={logo.alt} className={styles.tile}>
            <img src={logo.src} alt={logo.alt} className={styles.logo} draggable={false} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default LogoGrid;
