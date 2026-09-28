import Button, { type ButtonVariant } from '@/components/Button/Button';
import { limeOlive } from '@/assets/images/shapes/floaters';
import styles from './CtaBanner.module.css';

const tealBadge =
  'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1786649241/projectory-p-teal_twddmb.png';

/** Per-variant pieces CSS can't carry. Colours and badge rotation live in the module. */
const VARIANTS = {
  teal: { badge: tealBadge, button: 'teal' },
  lime: { badge: limeOlive, button: 'limeLight' },
} as const satisfies Record<string, { badge: string; button: ButtonVariant }>;

type CtaLink = { label: string; to: string };

interface CtaBannerProps {
  variant: keyof typeof VARIANTS;
  /** Anchor for in-page scroll links. */
  id?: string;
  title: string;
  body: string;
  primary: CtaLink;
  secondary?: CtaLink;
}

const CtaBanner = ({ variant, id, title, body, primary, secondary }: CtaBannerProps) => {
  const { badge, button } = VARIANTS[variant];

  return (
    <section id={id} className={`${styles.banner} ${styles[variant]}`}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
        <div className={styles.actions}>
          <Button variant={button} to={primary.to}>
            {primary.label}
          </Button>
          {secondary && (
            <Button variant="outline" to={secondary.to}>
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
      <img src={badge} alt="" className={styles.badge} aria-hidden />
    </section>
  );
};

export default CtaBanner;
