import Button, { type ButtonVariant } from '@/components/Button/Button';
import { apricot, tealP } from '@/assets/images/shapes/floaters';
import { ctaPair } from '../../productsData';
import styles from './CtaPair.module.css';

/** Per-accent pieces CSS can't carry. Colours and badge placement live in the module. */
const ACCENTS = {
  coral: { badge: apricot, button: 'coralLight' },
  teal: { badge: tealP, button: 'teal' },
} as const satisfies Record<string, { badge: string; button: ButtonVariant }>;

/** Two side-by-side CTA cards under the product grid, each with a bobbing P badge on a corner. */
const CtaPair = () => (
  <section className={styles.pair}>
    {ctaPair.map(({ accent, title, body, button }) => (
      <article key={accent} className={`${styles.card} ${styles[accent]}`}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          <Button variant={ACCENTS[accent].button} to={button.to}>
            {button.label}
          </Button>
        </div>
        <img src={ACCENTS[accent].badge} alt="" className={styles.badge} aria-hidden />
      </article>
    ))}
  </section>
);

export default CtaPair;
