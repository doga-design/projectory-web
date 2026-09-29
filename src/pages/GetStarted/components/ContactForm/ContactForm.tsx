import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@/components/Button/Button';
import styles from './ContactForm.module.css';
import HoneypotField from '@/components/HoneypotField/HoneypotField';
import { useLeadForm } from '@/hooks/useLeadForm';
import { fieldErrorMessage } from '@/lib/leads';

const MailIcon = () => (
  <svg
    className={styles.contactIcon}
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="15"
    viewBox="0 0 18 15"
    fill="none"
    aria-hidden
  >
    <path
      d="M17.8065 5.3129C17.7479 5.28028 17.6816 5.26404 17.6146 5.26589C17.5475 5.26774 17.4822 5.2876 17.4255 5.3234L10.788 9.9404C10.2512 10.2737 9.63187 10.4503 9 10.4503C8.36813 10.4503 7.74883 10.2737 7.212 9.9404L0.574501 5.3234C0.517723 5.28772 0.452417 5.26793 0.385389 5.26607C0.31836 5.26421 0.252059 5.28036 0.193393 5.31283C0.134726 5.34531 0.08584 5.39292 0.0518263 5.45071C0.0178126 5.50849 -8.39339e-05 5.57434 2.95952e-07 5.6414V11.9999C2.95952e-07 12.5966 0.237053 13.1689 0.65901 13.5909C1.08097 14.0128 1.65326 14.2499 2.25 14.2499H15.75C16.3467 14.2499 16.919 14.0128 17.341 13.5909C17.7629 13.1689 18 12.5966 18 11.9999V5.6414C18.0002 5.57431 17.9824 5.5084 17.9483 5.4506C17.9143 5.39279 17.8653 5.34523 17.8065 5.3129Z"
      fill="#131313"
    />
    <path
      d="M18 2.25C18 1.65326 17.7629 1.08097 17.341 0.659009C16.919 0.237053 16.3467 0 15.75 0H2.25C1.65326 0 1.08097 0.237053 0.65901 0.659009C0.237053 1.08097 1.25248e-07 1.65326 1.25248e-07 2.25C-2.82955e-05 2.26892 0.00478056 2.28753 0.0139691 2.30407C0.0231576 2.32061 0.0364205 2.33453 0.0524999 2.3445L8.4 8.0325C8.57875 8.14361 8.78503 8.2025 8.9955 8.2025C9.20597 8.2025 9.41225 8.14361 9.591 8.0325L17.943 2.3445C17.9598 2.33497 17.9739 2.32127 17.9839 2.30472C17.9939 2.28817 17.9994 2.26932 18 2.25Z"
      fill="#131313"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className={styles.contactIcon}
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
  >
    <path
      d="M17.3504 12.9061L15.4314 10.9863C15.227 10.7816 14.9843 10.6192 14.7171 10.5084C14.45 10.3975 14.1636 10.3405 13.8743 10.3405C13.5851 10.3405 13.2986 10.3975 13.0315 10.5084C12.7643 10.6192 12.5216 10.7816 12.3172 10.9863L11.9259 11.3776C9.99726 9.76165 8.21576 7.9778 6.60235 6.04702L6.99367 5.6557C7.40574 5.24242 7.63713 4.68262 7.63713 4.09902C7.63713 3.51541 7.40574 2.95561 6.99367 2.54234L5.07071 0.624853C4.6509 0.223798 4.09266 0 3.51207 0C2.93148 0 2.37324 0.223798 1.95343 0.624853L0.904687 1.67829C0.400729 2.18588 0.0867615 2.85141 0.0155043 3.56312C-0.0557528 4.27484 0.12004 4.9894 0.513364 5.58683C3.64011 10.2982 7.67767 14.3366 12.3884 17.4643C12.9879 17.854 13.7024 18.0276 14.4138 17.9565C15.1253 17.8853 15.7912 17.5736 16.3017 17.0729L17.3543 16.0195C17.559 15.8153 17.7214 15.5727 17.8322 15.3057C17.943 15.0386 18 14.7523 18 14.4632C18 14.1741 17.943 13.8878 17.8322 13.6207C17.7214 13.3537 17.559 13.1111 17.3543 12.9069L17.3504 12.9061Z"
      fill="#131313"
    />
  </svg>
);

const AddressIcon = () => (
  <svg
    className={styles.contactIcon}
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
  >
    <path
      d="M18 9C18 7.21997 17.4722 5.47991 16.4832 3.99987C15.4943 2.51983 14.0887 1.36628 12.4442 0.685088C10.7996 0.00389957 8.99002 -0.17433 7.24419 0.172936C5.49836 0.520203 3.89471 1.37737 2.63604 2.63604C1.37737 3.89471 0.520203 5.49836 0.172936 7.24419C-0.17433 8.99002 0.00389957 10.7996 0.685088 12.4442C1.36628 14.0887 2.51983 15.4943 3.99987 16.4832C5.47991 17.4722 7.21997 18 9 18H9.09375C11.455 17.9974 13.7189 17.0583 15.3886 15.3886C17.0583 13.7189 17.9974 11.455 18 9.09375V9.0465V9ZM16.5 9C16.4998 9.66739 16.4092 10.3317 16.2308 10.9748C16.2165 11.0265 16.1913 11.0746 16.1569 11.1158C16.1224 11.157 16.0795 11.1903 16.0311 11.2135C15.9827 11.2366 15.9299 11.2491 15.8762 11.2501C15.8225 11.2511 15.7693 11.2406 15.72 11.2193C15.2569 11.0188 14.8617 10.6885 14.5823 10.2683L12.9188 7.77225C12.7475 7.51547 12.5155 7.30492 12.2434 7.1593C11.9713 7.01368 11.6674 6.9375 11.3588 6.9375H11.034C10.487 6.9375 9.96239 6.7202 9.57559 6.33341C9.1888 5.94662 8.9715 5.42201 8.9715 4.875C8.9715 4.32799 9.1888 3.80339 9.57559 3.4166C9.96239 3.0298 10.487 2.8125 11.034 2.8125H13.113C13.1907 2.81251 13.2664 2.83662 13.3298 2.8815C14.3091 3.57338 15.1081 4.49013 15.6598 5.55479C16.2114 6.61945 16.4996 7.80092 16.5 9ZM1.63425 7.61625C1.65157 7.53142 1.6977 7.4552 1.76483 7.40052C1.83195 7.34583 1.91593 7.31606 2.0025 7.31625H5.25525C5.60012 7.31528 5.94176 7.38273 6.26038 7.51468C6.57901 7.64664 6.8683 7.84049 7.1115 8.085L7.95 8.925C8.42327 9.39851 8.69774 10.035 8.71726 10.7042C8.73678 11.3733 8.49987 12.0247 8.055 12.525L7.03575 13.6718C6.73061 14.0152 6.5622 14.4588 6.5625 14.9183V15.5385C6.56247 15.6008 6.54694 15.662 6.51732 15.7168C6.4877 15.7715 6.44491 15.818 6.39282 15.8521C6.34073 15.8862 6.28097 15.9068 6.21894 15.912C6.15691 15.9172 6.09456 15.9069 6.0375 15.882C4.69172 15.3034 3.54486 14.3433 2.7385 13.1203C1.93214 11.8973 1.50159 10.4649 1.5 9C1.50077 8.53554 1.54573 8.0722 1.63425 7.61625Z"
      fill="#131313"
    />
  </svg>
);

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const [status, setStatus] = useState('');
  const { send, sending, honeypotProps } = useLeadForm();

  // The Partners page "Register a Deal" button links here with ?source=register-deal.
  const [searchParams] = useSearchParams();
  const registerDeal = searchParams.get('source') === 'register-deal';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    const source = registerDeal ? { source: 'register-deal' } : {};
    const result = await send({
      form: 'contact',
      fields: { ...formData, ...source },
      fallback: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        ...source,
      },
    });

    if (result.ok) {
      setStatus('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
    } else {
      setStatus(fieldErrorMessage(result) ?? 'Failed to send message. Please try again.');
    }
  };

  return (
    <section className={styles.contactWrapper}>
      <div className={styles.infoColumn}>
        <p className={styles.eyebrow}>Contact Us</p>
        <h2 className={styles.title}>Get in touch today</h2>
        <p className={styles.body}>
          Have a specific question? Enter your contact info, and we&apos;ll send a quick orientation
          on how to get started.
        </p>

        <ul className={styles.contactList}>
          <li className={styles.contactItem}>
            <MailIcon />
            <a href="mailto:info@projectory.live">info@projectory.live</a>
          </li>
          <li className={styles.contactItem}>
            <PhoneIcon />
            <a href="tel:+18009668802">(800) 966-8802</a>
          </li>
          <li className={styles.contactItem}>
            <AddressIcon />
            <span>
              11 Hillsboro Av,
              <br />
              Toronto, ON, M5R1S6
            </span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className={styles.contactForm}>
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

        <Button type="submit" variant="coral" className={styles.submit} disabled={sending}>
          Get In Touch
        </Button>

        {status && <p className={styles.statusMessage}>{status}</p>}
      </form>
    </section>
  );
};

export default ContactForm;
