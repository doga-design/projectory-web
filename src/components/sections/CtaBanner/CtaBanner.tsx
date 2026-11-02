import Button, { type ButtonVariant } from '@/components/Button/Button';
import { limeOlive, tealP } from '@/assets/images/shapes/floaters';
import { scrollToId } from '@/lib/scrollToId';
import styles from './CtaBanner.module.css';

/** Per-variant pieces CSS can't carry. Colours and badge rotation live in the module. */
const VARIANTS = {
  teal: { badge: tealP, button: 'teal' },
  lime: { badge: limeOlive, button: 'limeLight' },
} as const satisfies Record<string, { badge: string; button: ButtonVariant }>;

/** A route (`to`), an in-page section id to smooth-scroll to (`scrollTo`), or a click handler. */
type CtaLink = { label: string } & (
  | { to: string }
  | { scrollTo: string }
  | { onClick: () => void }
);

const CtaButton = ({ link, variant }: { link: CtaLink; variant: ButtonVariant }) =>
  'onClick' in link ? (
    <Button variant={variant} onClick={link.onClick}>
      {link.label}
    </Button>
  ) : 'scrollTo' in link ? (
    <Button variant={variant} onClick={() => scrollToId(link.scrollTo)}>
      {link.label}
    </Button>
  ) : (
    <Button variant={variant} to={link.to}>
      {link.label}
    </Button>
  );

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
          <CtaButton link={primary} variant={button} />
          {secondary && <CtaButton link={secondary} variant="outline" />}
        </div>
      </div>
      <img src={badge} alt="" className={styles.badge} aria-hidden />
    </section>
  );
};

export default CtaBanner;
