import Marquee from 'react-fast-marquee';
import styles from './LogoMarquee.module.css';

export type Logo = { src: string; alt: string };

interface LogoMarqueeProps {
  logos: readonly Logo[];
  className?: string;
}

/** A slow, endlessly looping row of client logos that fades out at both edges. */
const LogoMarquee = ({ logos, className }: LogoMarqueeProps) => {
  return (
    <div className={`${styles.band}${className ? ` ${className}` : ''}`}>
      <Marquee speed={40} autoFill>
        {logos.map((logo) => (
          <img
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            className={styles.logo}
            draggable={false}
          />
        ))}
      </Marquee>
    </div>
  );
};

export default LogoMarquee;
