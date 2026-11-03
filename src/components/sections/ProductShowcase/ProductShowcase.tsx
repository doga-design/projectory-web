import Button from '@/components/Button/Button';
import type { Product } from '@/types/product';
import ProductDrift from './ProductDrift';
import styles from './ProductShowcase.module.css';

interface ProductShowcaseProps {
  eyebrow: string;
  /** Line breaks in the copy are kept. */
  title: string;
  body: string;
  cta: { label: string; to: string };
  products: readonly Product[];
}

/** A two-column intro in the page column, over a full-bleed row of drifting product cards. */
const ProductShowcase = ({ eyebrow, title, body, cta, products }: ProductShowcaseProps) => {
  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.copy}>
          <p className={styles.body}>{body}</p>
          <Button variant="pink" size="small" to={cta.to}>
            {cta.label}
          </Button>
        </div>
      </div>
      <ProductDrift products={products} />
    </section>
  );
};

export default ProductShowcase;
