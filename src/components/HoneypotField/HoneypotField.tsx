import styles from './HoneypotField.module.css';

type HoneypotFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Spam trap for the lead forms (see useLeadForm): bots fill every input, people never see
 * this one. Clipped rather than display:none (some bots skip hidden inputs), inside its
 * own zero-size box so whatever a form's `input` styles say, it takes no space and stays
 * invisible, and named so browser autofill and password managers have no reason to fill it.
 */
const HoneypotField = ({ value, onChange }: HoneypotFieldProps) => (
  <span className={styles.trap} aria-hidden="true">
    <input
      type="text"
      name="pd_hp_x7"
      tabIndex={-1}
      autoComplete="off"
      data-1p-ignore
      data-lpignore="true"
      data-bwignore
      data-form-type="other"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </span>
);

export default HoneypotField;
