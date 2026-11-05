import { useCallback, useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactDOM from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { findProductById } from '@/lib/findProduct';

import ProductHero from '@/components/sections/ProductHero/ProductHero';
import ProductDetails from '@/components/sections/ProductDetails/ProductDetails';
import QuickFacts from './components/QuickFacts/QuickFacts';
import Objectives from './components/Objectives/Objectives';
import FinalCTA from '@/components/sections/FinalCTA/FinalCTA';
import HowItWorks from './components/HowItWorks/HowItWorks';
import DataFeature from '@/components/sections/DataFeature/DataFeature';

import { useLikedProducts } from '@/context/LikedProductsContext';
import { playLikeBounce } from '@/lib/likeBounce';
import HeartIconSVG from '@/assets/images/heartIcon.svg';
import HeartIconSVG_Outline from '@/assets/images/heartIcon_outline.svg';
import CloudinaryImage from '@/components/CloudinaryImage/CloudinaryImage';

import styles from './ProductPage.module.css';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { DEFAULT_DESCRIPTION } from '@/config/seo';

const ProductPage = () => {
  const { id } = useParams();
  const product = findProductById(id);

  useDocumentMeta({
    title: product?.name,
    description: product?.shortDescription || product?.tagline || DEFAULT_DESCRIPTION,
  });

  const { likedProducts, toggleLike } = useLikedProducts();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: false,
  });

  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleCarouselClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goPrev, goNext]
  );

  const carouselRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorSide, setCursorSide] = useState<'left' | 'right'>('right');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || isMobile) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        setCursorPos({ x: e.clientX, y: e.clientY });
        setCursorSide(e.clientX - rect.left < rect.width / 2 ? 'left' : 'right');
        if (!cursorActive) {
          setCursorActive(true);
          setCursorVisible(true);
        }
      } else if (cursorActive) {
        setCursorVisible(false);
        setTimeout(() => setCursorActive(false), 200);
      }
    };

    const onLeave = () => {
      setCursorVisible(false);
      setTimeout(() => setCursorActive(false), 200);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [isMobile, cursorActive]);

  if (!product) {
    return <h2>Product Not Found</h2>;
  }

  const isLiked = likedProducts.includes(product.id);
  const firstImageSectionIndex = product.sections.findIndex((section) => section.type === 'image');

  return (
    <div className={styles.productPage}>
      {product.sections.map((section, index) => {
        switch (section.type) {
          case 'hero':
            return <ProductHero key={index} product={product} />;
          case 'details': {
            if (!section.content) return null;
            const detailsContent = {
              heading: 'heading' in section.content ? (section.content.heading as string) : '',
              description:
                'description' in section.content && section.content.description
                  ? (section.content.description as string)
                  : '',
              features:
                'features' in section.content ? (section.content.features as string[]) : undefined,
              headingType:
                'headingType' in section.content &&
                (section.content.headingType === 'features' ||
                  section.content.headingType === 'overview')
                  ? (section.content.headingType as 'features' | 'overview')
                  : undefined,
            };
            return <ProductDetails key={index} product={product} details={detailsContent} />;
          }
          case 'image': {
            if (!section.content || !section.content.imageUrl) return null;
            const isPrimaryImage = index === firstImageSectionIndex;

            if (isPrimaryImage) {
              const baseImages: string[] = (section.content.imageUrls as string[] | undefined) || [
                section.content.imageUrl as string,
              ];
              const minSlides = Math.ceil(4 / baseImages.length);
              const images: string[] = [];
              for (let r = 0; r < minSlides; r++) {
                images.push(...baseImages);
              }

              return (
                <div
                  key={index}
                  className={styles.carousel}
                  onClick={handleCarouselClick}
                  ref={carouselRef}
                >
                  <div className={styles.carouselViewport} ref={emblaRef}>
                    <div className={styles.carouselTrack}>
                      {images.map((imgUrl, i) => (
                        <div key={i} className={styles.carouselSlide}>
                          <CloudinaryImage
                            src={imgUrl}
                            alt=""
                            className={styles.carouselImage}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            const url = section.content.imageUrl;
            return (
              <div key={index}>
                <CloudinaryImage src={url} alt="" className={styles.fullPageImage} loading="lazy" />
              </div>
            );
          }
          case 'grid':
            if (!section.content || !section.content.items) return null;
            return <QuickFacts key={index} items={section.content.items} />;
          case 'objectives':
            if (!section.content) return null;
            return (
              <Objectives
                key={index}
                title={section.content.title || ''}
                titleColor={section.content.titleColor || ''}
                imageUrl={section.content.imageUrl || ''}
                objectives={section.content.objectives || []}
              />
            );
          case 'dataFeature':
            if (!section.content) return null;
            return (
              <DataFeature
                key={index}
                title={section.content.title || ''}
                description={section.content.description || ''}
                imageUrl={section.content.imageUrl || ''}
              />
            );
          case 'how-it-works':
            if (!section.content) return null;
            return (
              <HowItWorks
                key={index}
                title={section.content.title || ''}
                description={section.content.description || ''}
                imageUrl={section.content.imageUrl || ''}
              />
            );
          default:
            return null;
        }
      })}

      <FinalCTA experienceText="Products" experienceLink="/products" />

      <div className={styles.floatingLikeButton}>
        <button
          onClick={(e) => {
            if (!isLiked) playLikeBounce(e.currentTarget);
            toggleLike(product.id);
          }}
          className={styles.likeButton}
        >
          <img src={isLiked ? HeartIconSVG : HeartIconSVG_Outline} alt="Like/Unlike Product" />
        </button>

        <div className={styles.floatingText}>
          Like this product? <br />
          Click the heart to save it for later!
        </div>
      </div>

      {cursorActive &&
        !isMobile &&
        ReactDOM.createPortal(
          <div
            className={styles.carouselCursor}
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              opacity: cursorVisible ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${cursorVisible ? 1 : 0.8})`,
            }}
          >
            <div
              className={`${styles.cursorArrow} ${cursorSide === 'left' ? styles.cursorArrowLeft : styles.cursorArrowRight}`}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProductPage;
