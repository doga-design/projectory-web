import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useLocation, useSearchParams } from 'react-router-dom';
import { productsByName } from '@/data/products';
import ProductCard from '@/components/ProductCard/ProductCard';
import FeaturedCarousel from './components/FeaturedCarousel/FeaturedCarousel';
import ObjectiveFilter from './components/ObjectiveFilter/ObjectiveFilter';
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

const filterItems = productTags.map((tag, i) => ({
  key: tag.value,
  label: tag.label,
  accent: tag.accent,
  description: tag.description,
  href:
    i === 0
      ? `/products#${CATALOGUE_ID}`
      : `/products?tag=${encodeURIComponent(tag.value)}#${CATALOGUE_ID}`,
  count:
    i === 0
      ? productsByName.length
      : productsByName.filter((product) => product.tags.includes(tag.value)).length,
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

  const gridRef = useRef<HTMLDivElement>(null);
  const nearCatalogue = useInView(gridRef, { once: true, margin: '600px' });

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
          <ObjectiveFilter items={filterItems} activeIndex={activeIndex} />
          <div ref={gridRef} className={styles.grid}>
            {/* Every card stays mounted and filters only hide them, so switching never makes
                a card rebuild and redraw its image. */}
            {productsByName.map((product) => (
              <div
                key={product.id}
                hidden={activeIndex !== 0 && !product.tags.includes(activeTag.value)}
              >
                {/* Loaded once the catalogue is near, so a filter never reveals a blank card. */}
                <ProductCard product={product} imageLoading={nearCatalogue ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
        </section>

        <CtaPair />

        <CaseStudyFeature {...featuredStudy} />
      </div>
    </div>
  );
};

export default Products;
