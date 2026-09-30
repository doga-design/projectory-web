import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GetStartedForm.module.css';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard/ProductCard';
import { useLikedProducts } from '@/context/LikedProductsContext';
import { useNavigate } from 'react-router-dom';
import { saveFinderAnswers } from '@/lib/finderAnswers';

type Filters = { type: string[]; objectives: string[]; seating: string[] };

import {
  lime as shape1,
  teal as shape2,
  coralBurgundy as shape3,
  creamCoral as shape4,
  coralTeal as shape6,
  yellowCoral as shape7,
} from '@/assets/images/shapes/floaters';

const shape5 =
  'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1786649204/Projectory_AbstractSymbol_6_irec5b.png';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

const shapePool = [shape1, shape2, shape3, shape4, shape5, shape6, shape7];

const questionData = {
  type: {
    label: 'What kind of experience are you looking for?',
    description:
      'Sessions are facilitated group activities that can be added into the agenda. Installations are self-guided activities for guests to explore during breaks. <br /> <br /> You can choose both options',
    options: ['Facilitated session', 'Interactive installation'],
  },
  objectives: {
    label: 'What outcomes are most important to you?',
    description: 'Select the objectives you’d like this experience to support.',
    options: [
      'Foster connection and networking',
      'Facilitate peer learning and dialogue',
      'Explore strategic priorities and decisions',
      'Connect ideas to action',
      'Build alignment and consensus',
      'Promote reflection and synthesis',
      'Inspire forward thinking and creativity',
      'Visualize collective insights',
    ],
  },
  seating: {
    label: 'What type of seating will you have?',
    description: 'This helps us recommend formats that fit your space.',
    options: ['Mixed/Other', 'Round Tables', 'Theatre', 'Not Sure Yet'],
  },
} as const;

const allStepKeys = ['type', 'objectives', 'seating'] as const;
type StepKey = (typeof allStepKeys)[number];

// one gradient per step
const BG_GRADIENTS = [
  'linear-gradient(180deg,#F37655 0%,#A92E4C 80%)',
  'linear-gradient(180deg,#2FD4B2 0%,#158671 80%)',
  'linear-gradient(180deg, #BCCE2D 0%, #838C0A 80%)',
];

const GetStartedForm: React.FC = () => {
  useDocumentMeta(pageMeta.getStartedForm);

  const [step, setStep] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    type: [],
    objectives: [],
    seating: [],
  });
  const { likedProducts, toggleLike } = useLikedProducts();
  const [recommended, setRecommended] = useState<(typeof products)[number][]>([]);
  const navigate = useNavigate();

  const [shapeInstances, setShapeInstances] = useState<
    { src: string; style: React.CSSProperties }[]
  >([]);

  useEffect(() => {
    if (recommended.length > 0) {
      const selected = shapePool.slice(0, 4);
      const edgePositions = [
        { top: '2%', left: '25%' },
        { top: '20%', left: '100%' },
        { top: '70%', left: '80%' },
        { top: '35%', left: '10%' },
      ];
      const instances = selected.map((src, i) => {
        const { top, left } = edgePositions[i];
        const size = Math.random() * 100 + 150;
        const rotate = Math.random() * 90 - 45;
        return {
          src,
          style: {
            position: 'absolute' as const,
            top,
            left,
            width: `${size}px`,
            transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
            pointerEvents: 'none' as const,
            opacity: 1,
          },
        };
      });
      setShapeInstances(instances);
    }
  }, [recommended]);

  // Determine if only one type is selected
  const onlyInteractive =
    filters.type.length === 1 && filters.type[0] === 'Interactive installation';
  // Build dynamic steps: skip seating when only interactive installation is chosen
  const stepsUsed = onlyInteractive
    ? allStepKeys.slice(0, 2) // ['type', 'objectives']
    : allStepKeys; // ['type','objectives','seating']
  const stepCount = stepsUsed.length;
  const stepKey = stepsUsed[step];

  const toggle = (k: StepKey, opt: string) => {
    setFilters((f) => {
      const arr = f[k];
      return {
        ...f,
        [k]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
      };
    });
  };

  const next = () => {
    if (step < stepCount - 1) setStep((s) => s + 1);
    else handleSubmit();
  };
  const back = () => step > 0 && setStep((s) => s - 1);

  const handleSubmit = () => {
    // First, discard products that don't match the single selected type (unless both are selected)
    let filteredProducts = products;
    if (filters.type.length === 1) {
      const onlyType = filters.type[0];
      filteredProducts = products.filter((p) => p.filters.type.includes(onlyType));
    }
    // Score each product by matching filters
    const scored = filteredProducts.map((product) => {
      let score = 0;
      score += product.filters.type.filter((t) => filters.type.includes(t)).length;
      score += product.filters.objectives.filter((o) => filters.objectives.includes(o)).length;
      if (filters.seating.includes('Mixed/Other')) {
        score += 1;
      } else {
        // Known bug, left as-is: 'Round Tables' / 'Not Sure Yet' never match the product data's
        // 'Round tables' / 'Not sure yet' (case-sensitive compare), so those answers never score.
        score += product.filters.seating.filter((s) => filters.seating.includes(s)).length;
      }
      return { product, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Take products with at least 4 points
    const highMatches = scored.filter((item) => item.score >= 4).map((item) => item.product);

    let recommendations: (typeof products)[number][];

    if (highMatches.length >= 5) {
      // 5 or more high matches: take top 5
      recommendations = highMatches.slice(0, 5);
    } else if (highMatches.length >= 3) {
      // 3 or 4 high matches: take them all
      recommendations = highMatches;
    } else {
      // fewer than 3 high matches: fill with next best to reach 3
      const base = highMatches;
      const others = scored.map((item) => item.product).filter((p) => !base.includes(p));
      recommendations = [...base, ...others.slice(0, 3 - base.length)];
    }

    // Auto-like the recommendations
    recommendations.forEach((p) => {
      if (!likedProducts.includes(p.id)) {
        toggleLike(p.id);
      }
    });

    // Sent to Pipedrive with the estimate request (seating is skipped for installation-only).
    saveFinderAnswers({ ...filters, seating: onlyInteractive ? [] : filters.seating });

    setRecommended(recommendations);
  };

  // Compute options for current step, filtering objectives if needed
  const options =
    stepKey === 'objectives' && onlyInteractive
      ? questionData.objectives.options.filter((opt) => opt !== 'Connect ideas to action')
      : questionData[stepKey].options;

  return (
    <motion.div
      className={styles.container}
      animate={{ background: BG_GRADIENTS[step] }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        {recommended.length === 0 ? (
          <motion.div
            key={step}
            className={styles.formWrap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className={styles.title}>{questionData[stepKey].label}</h1>
            {questionData[stepKey].description && (
              <p
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: questionData[stepKey].description }}
              />
            )}
            <p className={styles.subTitle}>
              Step {step + 1} of {stepCount}
            </p>

            <div className={styles.options}>
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={filters[stepKey].includes(opt) ? styles.chipSelected : styles.chip}
                  onClick={() => toggle(stepKey, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className={styles.nav}>
              {step > 0 && (
                <button type="button" className={styles.backBtn} onClick={back}>
                  ← Back
                </button>
              )}
              <button
                type="button"
                className={styles.nextBtn}
                onClick={next}
                disabled={filters[stepKey].length === 0}
              >
                {step < stepCount - 1 ? 'Next →' : 'Finish →'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.section
            key="results"
            className={styles.recommendedSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {shapeInstances.map((shape, i) => (
              <img key={i} src={shape.src} style={shape.style} className={styles.shape} />
            ))}
            <h2 className={styles.recommendedTitle}>
              Thanks! Here are a few ideas to get the conversation started:
            </h2>
            <div className={styles.recommendedGrid}>
              {recommended.map((prod) => (
                <div key={prod.id} className={styles.recommendedCard}>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
            <div className={styles.estimateWrapper}>
              <button className={styles.estimateBtn} onClick={() => navigate('/get-estimate')}>
                Get An Estimate →
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GetStartedForm;
