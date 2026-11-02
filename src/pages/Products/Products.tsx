import { useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard/ProductCard';
import FeaturedCarousel from './components/FeaturedCarousel/FeaturedCarousel';
import TagWheel from './components/TagWheel/TagWheel';
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

const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

const wheelItems = productTags.map((tag, i) => ({
  key: tag.value,
  label: tag.label,
  // The way back to everything stays easy to spot (and pink) when another tag is picked.
  prominent: i === 0,
  href:
    i === 0
      ? `/products#${CATALOGUE_ID}`
      : `/products?tag=${encodeURIComponent(tag.value)}#${CATALOGUE_ID}`,
}));

const Products = () => {
  useDocumentMeta(pageMeta.products);

  const navigate = useNavigate();
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
      ? sortedProducts
      : sortedProducts.filter((product) => product.tags.includes(activeTag.value));

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
          <TagWheel
            items={wheelItems}
            activeIndex={activeIndex}
            onSelect={(i) => navigate(wheelItems[i].href)}
          />
          {/* All descriptions share one cell, so the block keeps the tallest one's height and
              the grid never shifts; switching tags only cross-fades them. */}
          <div
            className={`${styles.descriptions}${activeIndex === 0 ? ` ${styles.descriptionsAll}` : ''}`}
          >
            {productTags.map((tag, i) => (
              <p
                key={tag.value}
                className={`${styles.description}${i === activeIndex ? ` ${styles.descriptionActive}` : ''}`}
              >
                {tag.description}
              </p>
            ))}
          </div>
          <div ref={gridRef} className={styles.grid}>
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
