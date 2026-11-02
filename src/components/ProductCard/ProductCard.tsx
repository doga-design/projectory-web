import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLikedProducts } from '@/context/LikedProductsContext';
import { optimizeCloudinaryUrl } from '@/utils/cloudinaryHelpers';
import Button from '@/components/Button/Button';
import CloudinaryImage from '@/components/CloudinaryImage/CloudinaryImage';
import heartIcon from '@/assets/images/heart.svg';
import heartOutlineIcon from '@/assets/images/heart_outline.svg';
import styles from './ProductCard.module.css';

type ProductCardProduct = {
  id: string;
  name: string;
  category: string;
  categoryHighlight?: string | null;
  categoryColor?: string;
  thumbnail: string;
  bgVideo?: string;
  shortDescription?: string;
};

/** A square product tile. On hover (real pointers only) the video plays, the description opens
 *  and Learn More fills; the heart saves the product to the liked list. */
const ProductCard = ({ product }: { product: ProductCardProduct }) => {
  const navigate = useNavigate();
  const { likedProducts, toggleLike } = useLikedProducts();
  const isLiked = likedProducts.includes(product.id);
  const href = `/products/${product.id}`;

  // The video is only fetched once the card is first hovered.
  const [loadVideo, setLoadVideo] = useState(false);

  const thumbnail = optimizeCloudinaryUrl(product.thumbnail, 'f_auto,q_auto,w_900');
  const video = product.bgVideo && optimizeCloudinaryUrl(product.bgVideo, 'q_auto,w_900');

  return (
    <div
      className={styles.card}
      onClick={() => navigate(href)}
      onMouseEnter={() => setLoadVideo(true)}
    >
      <CloudinaryImage className={styles.media} src={thumbnail} alt={product.name} loading="lazy" />
      {loadVideo && video && (
        <video
          className={`${styles.media} ${styles.video}`}
          src={video}
          poster={thumbnail}
          preload="none"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      <div className={styles.content}>
        <h3 className={styles.title} style={{ color: product.categoryColor }}>
          {product.category}
          {product.categoryHighlight && <strong>{product.categoryHighlight}</strong>}
        </h3>

        <div className={styles.descWrapper}>
          <p className={styles.description}>{product.shortDescription}</p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="small"
            to={href}
            className={styles.learnMore}
            onClick={(e) => e.stopPropagation()}
          >
            Learn More
          </Button>
          <button
            type="button"
            className={`${styles.heart}${isLiked ? ` ${styles.liked}` : ''}`}
            aria-pressed={isLiked}
            aria-label={`Save ${product.name}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(product.id);
            }}
          >
            <img src={isLiked ? heartIcon : heartOutlineIcon} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Products come straight from the static data, so the reference only changes when the product does.
export default memo(ProductCard);
