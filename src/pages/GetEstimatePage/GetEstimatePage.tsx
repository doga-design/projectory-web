import React, { useState, useEffect } from 'react';
import { useLikedProducts } from '@/context/LikedProductsContext';
import { Link } from 'react-router-dom';
import { getProductsByIds } from '@/lib/findProduct';
import styles from './GetEstimatePage.module.css';
import HoneypotField from '@/components/HoneypotField/HoneypotField';
import { useLeadForm } from '@/hooks/useLeadForm';
import { fieldErrorMessage } from '@/lib/leads';
import { clearFinderAnswers, readFinderAnswers } from '@/lib/finderAnswers';

import { teal as shape2 } from '@/assets/images/shapes/floaters';

const shape1 =
  'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1786649204/Projectory_AbstractSymbol_6_irec5b.png';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

const GetEstimatePage: React.FC = () => {
  useDocumentMeta(pageMeta.getEstimate);

  const { likedProducts, toggleLike } = useLikedProducts();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventDate: '',
    eventLocation: '',
    message: '',
    selectedProducts: likedProducts.join(', '),
  });
  const [status, setStatus] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const { send, sending, honeypotProps } = useLeadForm();

  // Update selectedProducts field whenever likedProducts changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: likedProducts.join(', '),
    }));
  }, [likedProducts]);

  // Handle changes on visible form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sends to Pipedrive with product names and the Product Finder answers; the Web3Forms email
  // (unchanged from before) is the backup.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    const result = await send({
      form: 'estimate',
      fields: {
        name: formData.name,
        email: formData.email,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        message: formData.message,
        products: getProductsByIds(likedProducts).map((p) => p.name),
        finder: readFinderAnswers(),
      },
      fallback: {
        subject: 'Estimate Request from Projectory',
        from_name: formData.name,
        name: formData.name,
        email: formData.email,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        message: formData.message,
        selectedProducts: formData.selectedProducts,
      },
    });

    if (result.ok) {
      clearFinderAnswers();
      setShowOverlay(true);
      setStatus('');
    } else {
      setStatus(fieldErrorMessage(result) ?? 'Failed to send message. Please try again.');
    }
  };

  // Retrieve the full product objects for the liked items (likedProducts is assumed to be an array of product IDs)
  const likedItems = getProductsByIds(likedProducts);

  return (
    <section className={styles.getEstimateWrapper}>
      {/* Left Column: Display Liked Products */}
      <div className={styles.leftColumn}>
        <h2>Your Selected Products:</h2>
        <div className={styles.likedItemsWrapper}>
          {likedItems.length === 0 ? (
            <p>No products selected</p>
          ) : (
            likedItems.map((prod) => (
              <div key={prod.id} className={styles.likedItem}>
                <div className={styles.itemWrapper}>
                  <div className={styles.itemImageWrapper}>
                    <Link to={`/products/${prod.id}`}>
                      <img src={prod.thumbnail} alt={prod.name} />
                    </Link>
                  </div>
                  <div className={styles.itemTextWrapper}>
                    <Link to={`/products/${prod.id}`}>
                      <h4
                        className={styles.title}
                        style={{ color: prod.categoryColor || '#ffffff' }}
                      >
                        {prod.category}
                        <strong>{prod.categoryHighlight}</strong>
                      </h4>
                      <p>{prod.tagline}</p>
                    </Link>
                    <button className={styles.removeButton} onClick={() => toggleLike(prod.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Estimate Form */}
      <div className={styles.rightColumn}>
        <h2>So, What’s Next?</h2>

        <p>
          You’ve made some great picks! Tell us a bit more about your event, and we’ll follow up
          with more details on how we can work together.
        </p>

        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.estimateForm}>
            {/* Hidden fields for Web3Forms */}

            <input
              type="hidden"
              name="selectedProducts"
              value={formData.selectedProducts}
              readOnly
            />
            <HoneypotField {...honeypotProps} />

            {/* Visible fields */}
            <label>
              Name
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Event Date
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Event Location
              <input
                type="text"
                name="eventLocation"
                placeholder="Location"
                value={formData.eventLocation}
                onChange={handleChange}
              />
            </label>

            <label>
              Message
              <textarea
                name="message"
                placeholder="Please type your message..."
                value={formData.message}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className={styles.submitButton} disabled={sending}>
              Get An Estimate
            </button>
            {status && <p className={styles.statusMessage}>{status}</p>}
          </form>
        </div>
      </div>
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2>Thank you {formData.name}, your form has been submitted!</h2>
            <p>
              We’ll be in touch soon with an estimate and a quick orientation on how to get started.
            </p>
            <a
              href="https://ca.linkedin.com/company/theprojectory"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.overlayButton}
            >
              Get Updates on LinkedIn
            </a>{' '}
            <br />
            <Link to="/" className={styles.overlayLink}>
              Take Me Home
            </Link>
          </div>
          <div className={styles.overlayShapes}>
            <img src={shape1} alt="Shape 1" className={`${styles.shape} ${styles.shapeOne} `} />
            <img src={shape2} alt="Shape 2" className={`${styles.shape} ${styles.shapeTwo} `} />
          </div>
        </div>
      )}
    </section>
  );
};

export default GetEstimatePage;
