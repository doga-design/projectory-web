import { useNavigate } from 'react-router-dom';
import { caseStudiesData } from '@/data/caseStudies';
import Button from '@/components/Button/Button';
import CloudinaryImage from '@/components/CloudinaryImage/CloudinaryImage';
import styles from './CaseStudyFeature.module.css';

interface CaseStudyFeatureProps {
  eyebrow: string;
  /** Line breaks in the copy are kept. */
  title: string;
  /** The title's line breaks once it has the full width (stacked), if they differ. */
  titleWide?: string;
  cta: { label: string; to: string };
  /** The study to feature; its headline, name and colour come from caseStudiesData. */
  studyId: string;
  image: string;
}

/** A section intro beside one large, clickable case study card with its text on the image. */
const CaseStudyFeature = ({
  eyebrow,
  title,
  titleWide = title,
  cta,
  studyId,
  image,
}: CaseStudyFeatureProps) => {
  const navigate = useNavigate();
  const study = caseStudiesData.find((s) => s.id === studyId);
  if (!study) return null;
  const href = `/case-study/${study.id}`;

  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>
          <span className={styles.titleColumn}>{title}</span>
          <span className={styles.titleWide}>{titleWide}</span>
        </h2>
        <Button variant="pink" to={cta.to} className={styles.cta}>
          {cta.label}
        </Button>
      </div>

      <div className={styles.card} onClick={() => navigate(href)}>
        <CloudinaryImage className={styles.image} src={image} alt={study.name} loading="lazy" />
        <div className={styles.content}>
          <h3 className={styles.headline}>{study.tagline}</h3>
          <p className={styles.subtitle} style={{ color: study.titleColor }}>
            {study.name}
          </p>
          <Button
            variant="outline"
            size="small"
            to={href}
            className={styles.learnMore}
            onClick={(e) => e.stopPropagation()}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyFeature;
