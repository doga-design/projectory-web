// Partner application as a dark-glass overlay, opened from a program card's "Apply".
// Fields mirror the Get Started contact form. The title's program and the Apply
// button (the cards' Apply button, filled with the accent) take the program's accent.
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from '@/components/Button/Button';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import HoneypotField from '@/components/HoneypotField/HoneypotField';
import { useLeadForm } from '@/hooks/useLeadForm';
import { fieldErrorMessage } from '@/lib/leads';
import { partnerPrograms, type PartnerProgram } from '../../partnersData';
import styles from './ApplyFormOverlay.module.css';

interface ApplyFormOverlayProps {
  /** The card whose Apply was clicked; `null` keeps the overlay closed. */
  program: PartnerProgram | null;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const emptyForm = { name: '', email: '', phone: '', company: '', message: '' };

const cardFor = (program: PartnerProgram) =>
  partnerPrograms.cards.find((c) => c.title === program)!;

const ApplyFormOverlay = ({ program, onClose }: ApplyFormOverlayProps) => {
  const open = program !== null;

  useEscapeKey(onClose, open);
  useScrollLock(open);

  return createPortal(
    <AnimatePresence>
      {program && (
        <motion.div
          key="backdrop"
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <motion.div
            className={styles.frame}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* Mounted per open, so every open starts from the clicked card with a fresh form. */}
            <OverlayPanel initialProgram={program} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

interface OverlayPanelProps {
  initialProgram: PartnerProgram;
  onClose: () => void;
}

const OverlayPanel = ({ initialProgram, onClose }: OverlayPanelProps) => {
  const [selected, setSelected] = useState<PartnerProgram>(initialProgram);
  const [formData, setFormData] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('');
  const { send, sending, honeypotProps } = useLeadForm();
  const titleId = useId();
  const reduceMotion = useReducedMotion();

  // The panel's height tracks its content, so the form → confirmation swap
  // morphs instead of jumping. Clamped to the panel's max-height so a tall,
  // scrolling form (phones) starts shrinking from what's actually on screen.
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    const el = contentRef.current!;
    const ro = new ResizeObserver(() =>
      setHeight(Math.min(el.offsetHeight, window.innerHeight - 48))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const card = cardFor(selected);

  const cycle = () => {
    const { cards } = partnerPrograms;
    const i = cards.findIndex((c) => c.title === selected);
    setSelected(cards[(i + 1) % cards.length].title);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Goes to Pipedrive as a lead; a Web3Forms email is the backup if Pipedrive can't take it.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    const result = await send({
      form: 'partner-application',
      fields: { ...formData, program: selected },
      fallback: {
        subject: `Partner application (${selected})`,
        from_name: formData.name,
        ...formData,
        program: selected,
      },
      embedded: true,
    });
    if (result.ok) setSubmitted(true);
    else setStatus(fieldErrorMessage(result) ?? 'Something went wrong. Please try again.');
  };

  return (
    <motion.div
      className={`${styles.panel} ${styles[card.accent]}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={false}
      // Natural height until submit: converting `auto` mid-entrance reads the 0.98-scaled box and snaps at the end.
      animate={{ height: submitted ? height : 'auto' }}
      // Ease-in-out, not the entrance EASE: a size change reads smoother when it doesn't lurch off the mark.
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] }}
    >
      <div ref={contentRef} className={styles.content}>
        {/* `wait`: the form fades out at full height, then the shorter confirmation mounts and the panel eases down to it. */}
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="success"
              className={styles.success}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
            >
              <h2 id={titleId} className={styles.title}>
                Application sent for <span className={styles.programTag}>{selected}</span>
              </h2>
              <p className={styles.successBody}>
                Thanks, {formData.name.split(' ')[0]}. We’ll be in touch shortly.
              </p>
              <button type="button" className={styles.backLink} onClick={onClose}>
                Back to the website
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className={styles.form}
              onSubmit={handleSubmit}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className={styles.heading}>
                {/* The program is picked from the title: each click rolls to the next one. */}
                <h2 id={titleId} className={styles.title}>
                  Apply to{' '}
                  <button
                    type="button"
                    className={styles.programToggle}
                    onClick={cycle}
                    aria-label={`Program: ${selected}. Change program`}
                  >
                    <span className={styles.reel}>
                      {/* Invisible sizers keep the button as wide as the widest program, so nothing shifts mid-roll. */}
                      {partnerPrograms.cards.map(({ title }) => (
                        <span key={title} className={styles.sizer} aria-hidden>
                          {title}
                        </span>
                      ))}
                      <AnimatePresence initial={false}>
                        <motion.span
                          key={selected}
                          className={styles.word}
                          initial={{ y: reduceMotion ? 0 : '100%', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: reduceMotion ? 0 : '-100%', opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE }}
                        >
                          {selected}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </button>
                </h2>
                <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                  <FiX size={32} strokeWidth={1.25} aria-hidden />
                </button>
              </div>
              <input type="hidden" name="program" value={selected} />
              <HoneypotField {...honeypotProps} />

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>E-Mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your e-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Company</span>
                  <input
                    type="text"
                    name="company"
                    placeholder="Enter your company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Message</span>
                <textarea
                  name="message"
                  placeholder="Tell us about your question or inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </label>

              <Button type="submit" variant="light" className={styles.submit} disabled={sending}>
                Apply
              </Button>
              {status && (
                <p className={styles.statusMessage} role="alert">
                  {status}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ApplyFormOverlay;
