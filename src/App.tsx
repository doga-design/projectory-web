import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout/Layout';
import ScrollToTop from '@/components/layout/ScrollToTop/ScrollToTop';
import { LikedProductsProvider } from '@/context/LikedProductsContext';
import LoadingScreen from '@/components/layout/LoadingScreen/LoadingScreen';

const Home = lazy(() => import('@/pages/Home/Home'));
const WhoWeAre = lazy(() => import('@/pages/WhoWeAre/WhoWeAre'));
const CaseStudies = lazy(() => import('@/pages/CaseStudies/CaseStudies'));
const GetStarted = lazy(() => import('@/pages/GetStarted/GetStarted'));
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPages/CaseStudyPage'));
const Product = lazy(() => import('@/pages/Products/Products'));
const ProductPage = lazy(() => import('@/pages/ProductPages/ProductPage'));
const GetEstimatePage = lazy(() => import('@/pages/GetEstimatePage/GetEstimatePage'));
const GetStartedForm = lazy(() => import('@/pages/GetStartedForm/GetStartedForm'));
const ComboConvoForm = lazy(() => import('@/pages/activities/ComboConvo/ComboConvoForm'));
const ComboConvoAltForm = lazy(() => import('@/pages/activities/ComboConvoAlt/ComboConvoAltForm'));
const LaserFocusForm = lazy(() => import('@/pages/activities/LaserFocus/LaserFocusForm'));
const ScatterPlot = lazy(() => import('@/pages/activities/LaserFocus/ScatterPlot/ScatterPlot'));
const VentingMachine = lazy(() => import('@/pages/activities/VentingMachine/VentingMachine'));
const Pricing = lazy(() => import('@/pages/Pricing/Pricing'));
const Partners = lazy(() => import('@/pages/Partners/Partners'));

const MIN_LOADING_MS = 1200;
const FADE_OUT_MS = 500;

/** Build-time kill switch, so the loader can be A/B'd per deploy without a code change. */
const LOADING_SCREEN_ON = import.meta.env.VITE_LOADING_SCREEN !== 'off';

const App = () => {
  const [showLoader, setShowLoader] = useState(LOADING_SCREEN_ON);
  const [fadeOut, setFadeOut] = useState(false);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => setShowLoader(false), FADE_OUT_MS);
  }, []);

  useEffect(() => {
    if (!LOADING_SCREEN_ON) return;

    const start = performance.now();
    let frame = 0;
    let timer = 0;

    // Dismiss once the app itself has painted. Gating on `window.load` instead
    // waited on every image, every <video preload="metadata"> and the stylesheet,
    // which stretched the black screen to ~6s on a throttled connection.
    const finish = () => {
      const remaining = Math.max(0, MIN_LOADING_MS - (performance.now() - start));
      timer = window.setTimeout(dismiss, remaining);
    };

    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(finish);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [dismiss]);

  return (
    <LikedProductsProvider>
      {showLoader && <LoadingScreen fadeOut={fadeOut} />}
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/who-we-are" element={<WhoWeAre />} />
              <Route path="/products" element={<Product />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/case-study/:id" element={<CaseStudyPage />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/get-estimate" element={<GetEstimatePage />} />
              <Route path="/get-started-form" element={<GetStartedForm />} />
              <Route path="/comboconvo" element={<ComboConvoForm />} />
              <Route path="/comboconvo-noemail" element={<ComboConvoAltForm />} />
              <Route path="/laserfocus" element={<LaserFocusForm />} />
              <Route path="/laserfocus/scatterplot" element={<ScatterPlot />} />
              <Route path="/ventingmachine" element={<VentingMachine />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </LikedProductsProvider>
  );
};

export default App;
