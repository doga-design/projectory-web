import { useState, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import styles from './Navbar.module.css';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import logo from '@/assets/images/logo.svg';
import HeartIconNavSVG from '@/assets/images/heartIconNav.svg';
import SlideInMenu from '../SlideInMenu/SlideInMenu';
import CtaButton from '@/components/CtaButton/CtaButton';
import { useLikedProducts } from '@/context/LikedProductsContext';

const NAV_LINKS = [
  { to: '/who-we-are', label: 'Who We Are' },
  { to: '/products', label: 'Products' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/partners', label: 'Partners' },
  { to: '/pricing', label: 'Pricing' },
] as const;

type NavIslandProps = {
  variant: 'like' | 'menu';
  menuOpen: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'>;

/** Shared mobile island chrome — like + hamburger use the same transitions. */
function NavIsland({ variant, menuOpen, className, children, ...rest }: NavIslandProps) {
  const variantClass = variant === 'like' ? styles.likeIsland : styles.menuIsland;
  return (
    <button
      type="button"
      className={`${styles.navIsland} ${variantClass}${className ? ` ${className}` : ''}`}
      tabIndex={menuOpen ? -1 : undefined}
      aria-hidden={menuOpen}
      {...rest}
    >
      {children}
    </button>
  );
}

const LIKE_ENTER_MS = 450;
const LIKE_EXIT_MS = 200;
const HEART_PULSE_MS = 360;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSlideInOpen, setIsSlideInOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [likeMounted, setLikeMounted] = useState(false);
  const [likeMotion, setLikeMotion] = useState<'enter' | 'exit' | null>(null);
  const [heartPulse, setHeartPulse] = useState(false);
  const { likedProducts } = useLikedProducts();
  const prevLikedCount = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const count = likedProducts.length;
    const prev = prevLikedCount.current;

    if (count > 0 && prev === 0) {
      setLikeMounted(true);
      setLikeMotion('enter');
    } else if (count === 0 && prev > 0) {
      setLikeMotion('exit');
    } else if (count > prev && prev > 0) {
      setHeartPulse(true);
    }

    prevLikedCount.current = count;
  }, [likedProducts.length]);

  useEffect(() => {
    if (likeMotion !== 'enter') return;
    const t = window.setTimeout(() => setLikeMotion(null), LIKE_ENTER_MS);
    return () => window.clearTimeout(t);
  }, [likeMotion]);

  useEffect(() => {
    if (likeMotion !== 'exit') return;
    const t = window.setTimeout(() => {
      setLikeMounted(false);
      setLikeMotion(null);
    }, LIKE_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [likeMotion]);

  useEffect(() => {
    if (!heartPulse) return;
    const t = window.setTimeout(() => setHeartPulse(false), HEART_PULSE_MS);
    return () => window.clearTimeout(t);
  }, [heartPulse]);

  // The navbar is the only overlay that compensates for the scrollbar width.
  useScrollLock(menuOpen, { compensateScrollbar: true });

  useEscapeKey(() => setMenuOpen(false), menuOpen);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  const likeMotionClass =
    likeMotion === 'enter'
      ? styles.likeButtonReveal
      : likeMotion === 'exit'
        ? styles.likeButtonExit
        : undefined;
  const heartIconClass = `${styles.heartIcon}${heartPulse ? ` ${styles.heartPulse}` : ''}`;

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div
          className={`${styles.menuOverlay} ${menuOpen ? styles.open : ''}`}
          onClick={closeMenu}
          aria-hidden={!menuOpen}
        />

        <div className={`${styles.navCluster} ${menuOpen ? styles.expanded : ''}`}>
          <div className={styles.navShell}>
            <div className={styles.navRow}>
              <Link to="/" className={styles.logo}>
                <img src={logo} alt="Projectory Logo" className={styles.logoImage} />
              </Link>

              <div className={styles.navEnd}>
                <div className={styles.navRight}>
                  <ul className={styles.desktopNav}>
                    {NAV_LINKS.map(({ to, label }) => (
                      <li key={to}>
                        <Link to={to}>{label}</Link>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.navActions}>
                    <CtaButton to="/get-started">Get Started</CtaButton>
                    {likeMounted && (
                      <button
                        className={`${styles.slideInToggleBtn}${likeMotionClass ? ` ${likeMotionClass}` : ''}`}
                        onClick={() => setIsSlideInOpen(true)}
                        aria-label="Liked products"
                        tabIndex={likeMotion === 'exit' ? -1 : undefined}
                      >
                        <img className={heartIconClass} src={HeartIconNavSVG} alt="" />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.navMobileTrailing}>
                  <button
                    type="button"
                    className={styles.closeToggle}
                    onClick={toggleMenu}
                    aria-label="Close menu"
                    aria-expanded={menuOpen}
                    aria-hidden={!menuOpen}
                    tabIndex={menuOpen ? undefined : -1}
                  >
                    <FiX className={styles.menuIcon} />
                  </button>
                </div>
              </div>
            </div>

            <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
              <ul>
                {NAV_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} onClick={closeMenu}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <CtaButton to="/get-started" className={styles.mobileCtaButton} onClick={closeMenu}>
                Get Started
              </CtaButton>
            </div>
          </div>

          <div className={styles.navIslands}>
            {likeMounted && (
              <NavIsland
                variant="like"
                menuOpen={menuOpen}
                className={likeMotionClass}
                onClick={() => setIsSlideInOpen(true)}
                aria-label="Liked products"
                tabIndex={menuOpen || likeMotion === 'exit' ? -1 : undefined}
              >
                <img className={heartIconClass} src={HeartIconNavSVG} alt="" />
              </NavIsland>
            )}

            <NavIsland
              variant="menu"
              menuOpen={menuOpen}
              onClick={toggleMenu}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <FiMenu className={styles.menuIcon} />
            </NavIsland>
          </div>
        </div>
      </nav>

      <SlideInMenu isOpen={isSlideInOpen} onClose={() => setIsSlideInOpen(false)} />
    </>
  );
};

export default Navbar;
