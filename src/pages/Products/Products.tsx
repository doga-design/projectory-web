import { useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { productsByName } from '@/data/products';
import ProductCard from '@/components/ProductCard/ProductCard';
import FeaturedCarousel from './components/FeaturedCarousel/FeaturedCarousel';
import CatalogueChips from './components/CatalogueChips/CatalogueChips';
import CtaPair from './components/CtaPair/CtaPair';
import CaseStudyFeature from '@/components/sections/CaseStudyFeature/CaseStudyFeature';
import LandingHero from '@/components/LandingHero/LandingHero';
import { featuredStudy, productTags } from './productsData';
import styles from './Products.module.css';
import { useCatalogueScroll } from './useCatalogueScroll';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

/** The catalogue's anchor; the footer's product links point here too. */
const CATALOGUE_ID = 'tagContent';

const chipItems = productTags.map((tag, i) => ({
  key: tag.value,
  label: tag.label,
  accent: tag.accent,
  href:
    i === 0
      ? `/products#${CATALOGUE_ID}`
      : `/products?tag=${encodeURIComponent(tag.value)}#${CATALOGUE_ID}`,
}));

const Products = () => {
  useDocumentMeta(pageMeta.products);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const anchorRef = useRef<HTMLDivElement>(null);

  // The URL is the selection; anything unrecognised falls back to All Products.
  const param = searchParams.get('tag')?.toLowerCase();
  const activeIndex = Math.max(
    0,
    productTags.findIndex((tag) => tag.value.toLowerCase() === param)
  );
  const activeTag = productTags[activeIndex];
  const visibleProducts =
    activeIndex === 0
      ? productsByName
      : productsByName.filter((product) => product.tags.includes(activeTag.value));

  const gridRef = useRef<HTMLDivElement>(null);
  const scrollToCatalogue = useCatalogueScroll(anchorRef, gridRef, location);

  return (
    <div className={styles.productPage}>
      <LandingHero
        className={styles.hero}
        pill="Products"
        title={'Make Your Event\nUnmissable'}
        description="Projectory transforms half-listening event attendees into an engaged cohort of active, connected participants."
        buttonLabel="Explore Products"
        onButtonClick={scrollToCatalogue}
        // Small hack!!: Products copy wraps awkwardly at the shared hero description max-width.
        wideDescription
        solidShapes
        swapSidesOnMobile
        entranceKey="products"
      />

      <div className={styles.container}>
        <FeaturedCarousel />

        <section className={styles.catalogue}>
          <div id={CATALOGUE_ID} ref={anchorRef} className={styles.anchor} />
          {/* All descriptions share one cell, so the block keeps the tallest one's height and
              the grid never shifts; switching tags only cross-fades them. */}
          <div className={styles.descriptions}>
            {productTags.map((tag, i) => (
              <p
                key={tag.value}
                className={`${styles.description}${i === activeIndex ? ` ${styles.descriptionActive}` : ''}`}
              >
                {tag.description}
              </p>
            ))}
          </div>
          <div className={styles.layout}>
            <CatalogueChips items={chipItems} activeIndex={activeIndex} className={styles.chips} />
            <div ref={gridRef} className={styles.grid}>
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <CtaPair />

        <CaseStudyFeature {...featuredStudy} />
      </div>
    </div>
  );
};

export default Products;
