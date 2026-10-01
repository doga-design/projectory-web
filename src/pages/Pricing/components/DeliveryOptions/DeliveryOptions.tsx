import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { deliveryOptions, deliveryOptionsNote } from '../../pricingData';
import Button from '@/components/Button/Button';
import MutedNote from '@/components/MutedNote/MutedNote';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import { above } from '@/config/breakpoints';
import styles from './DeliveryOptions.module.css';

const amberBadge =
  'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1786649240/projectory-p-amber_q8opqw.png';
const tealBadge =
  'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1786649241/projectory-p-teal_twddmb.png';

type Entrance = ReturnType<typeof usePageEntrance>;

interface DeliveryOptionsProps {
  entrance?: Entrance;
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    className={styles.checkIcon}
    aria-hidden
  >
    <path
      d="M9.49805 19C14.7449 19 18.998 14.7468 18.998 9.5C18.998 4.25315 14.7449 0 9.49805 0C4.2512 0 -0.00195312 4.25315 -0.00195312 9.5C-0.00195312 14.7468 4.2512 19 9.49805 19Z"
      fill="white"
    />
    <path
      d="M5.19727 10.1143L7.65398 12.571L13.7958 6.4292"
      stroke="#1C1C1C"
      strokeWidth="1.66102"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CircleIcon = () => <span className={styles.circleIcon} aria-hidden />;

const DeliveryOptions = ({ entrance }: DeliveryOptionsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const amberX = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const amberY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const amberRotate = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const tealYDesktop = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const tealRotateDesktop = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const tealRotateMobile = useTransform(scrollYProgress, [0, 1], [0, -28]);

  useEffect(() => {
    const mq = window.matchMedia(above('tablet'));
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const play = entrance?.play ?? true;
  const sectionInitial = play ? { opacity: 0, y: 40 } : false;

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      initial={sectionInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.8, ease: [0.08, 0.82, 0.17, 1], delay: play ? 0.8 : 0 }}
    >
      <div className={styles.cards}>
        {deliveryOptions.map((card, index) => (
          <div key={index} className={styles.column}>
            {index === 1 && (
              <motion.img
                src={tealBadge}
                alt=""
                className={styles.badgeTeal}
                style={{
                  y: desktop ? tealYDesktop : 0,
                  rotate: desktop ? tealRotateDesktop : tealRotateMobile,
                }}
                aria-hidden
              />
            )}
            <div className={styles.card}>
              <div className={styles.content}>
                <div className={styles.hero}>
                  <p className={styles.eyebrow}>{card.eyebrow}</p>
                  <h2 className={styles.title}>{card.title}</h2>
                  <p className={styles.subtitle}>{card.subtitle}</p>
                  <div className={styles.divider} />
                </div>

                <div className={styles.body}>
                  {'featureGroups' in card && card.featureGroups ? (
                    <div className={styles.featureGroups}>
                      {card.featureGroups.map((group) => (
                        <div key={group.title} className={styles.featureGroup}>
                          <p className={styles.featureGroupTitle}>{group.title}</p>
                          <ul className={styles.featureList}>
                            {group.items.map((item) => (
                              <li key={item} className={styles.featureItem}>
                                <CircleIcon />
                                <span className={styles.featureText}>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className={styles.featureList}>
                      {'features' in card &&
                        card.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className={styles.featureItem}>
                            <CheckIcon />
                            <span className={styles.featureText}>{feature}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                {'cta' in card && card.cta ? (
                  <div className={styles.footer}>
                    {'note' in card.cta && card.cta.note ? (
                      <p className={styles.ctaNote}>{card.cta.note}</p>
                    ) : null}
                    <div className={styles.footerRow}>
                      {'title' in card.cta && card.cta.title ? (
                        <div className={styles.ctaCopy}>
                          <div className={styles.ctaTitleRow}>
                            <span className={styles.ctaTitle}>{card.cta.title}</span>
                            {'currency' in card.cta && card.cta.currency ? (
                              <span className={styles.ctaCurrency}>{card.cta.currency}</span>
                            ) : null}
                          </div>
                          {'caption' in card.cta && card.cta.caption ? (
                            <p className={styles.ctaCaption}>{card.cta.caption}</p>
                          ) : null}
                        </div>
                      ) : null}
                      <Button variant="light" to={card.cta.button.to} className={styles.ctaButton}>
                        {card.cta.button.label}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            {index === 0 && (
              <motion.img
                src={amberBadge}
                alt=""
                className={styles.badgeAmber}
                style={{
                  x: desktop ? amberX : 0,
                  y: desktop ? amberY : 0,
                  rotate: amberRotate,
                }}
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
      <MutedNote>{deliveryOptionsNote}</MutedNote>
    </motion.section>
  );
};

export default DeliveryOptions;
