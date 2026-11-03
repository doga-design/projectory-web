import Button from '@/components/Button/Button';
import styles from './CatalogueChips.module.css';

export type ChipAccent = 'white' | 'teal' | 'yellow' | 'pink' | 'coral';

type CatalogueChip = { key: string; label: string; href: string; accent: ChipAccent };

interface CatalogueChipsProps {
  items: readonly CatalogueChip[];
  activeIndex: number;
  className?: string;
}

/** The catalogue's objective filters. Each is a link, so filters can be shared and bookmarked. */
const CatalogueChips = ({ items, activeIndex, className }: CatalogueChipsProps) => {
  return (
    <nav
      className={`${styles.chips}${className ? ` ${className}` : ''}`}
      aria-label="Filter products by objective"
    >
      {items.map((item, i) => (
        <Button
          key={item.key}
          variant="outline"
          size="small"
          to={item.href}
          className={`${styles.chip} ${styles[item.accent]}${i === activeIndex ? ` ${styles.active}` : ''}`}
          aria-current={i === activeIndex ? 'page' : undefined}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default CatalogueChips;
