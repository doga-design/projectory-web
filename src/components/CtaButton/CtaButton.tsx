import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './CtaButton.module.css';

// The navbar "Get Started" button, shared. Coral with a white label by default;
// callers recolour it through --cta-bg / --cta-fg / --cta-hover (see the CSS).

type Base = { children: ReactNode; className?: string };

type CtaAsLink = Base & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

type CtaAsButton = Base &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: never };

type CtaButtonProps = CtaAsLink | CtaAsButton;

const CtaButton = ({ children, className, ...rest }: CtaButtonProps) => {
  const classes = className ? `${styles.cta} ${className}` : styles.cta;
  const label = <span className={styles.label}>{children}</span>;

  if (rest.to !== undefined) {
    return (
      <Link {...(rest as CtaAsLink)} className={classes}>
        {label}
      </Link>
    );
  }

  const { type, ...buttonProps } = rest as CtaAsButton;
  return (
    <button {...buttonProps} type={type ?? 'button'} className={classes}>
      {label}
    </button>
  );
};

export default CtaButton;
