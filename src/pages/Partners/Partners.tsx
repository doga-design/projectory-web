import styles from './Partners.module.css';
import PartnersHero from './components/PartnersHero/PartnersHero';
import PartnerPrograms from './components/PartnerPrograms/PartnerPrograms';
import CtaBanner from '@/components/sections/CtaBanner/CtaBanner';
import CyclingCards from '@/components/sections/CyclingCards/CyclingCards';
import LogoGrid from '@/components/sections/LogoGrid/LogoGrid';
import TestimonialFeature from '@/components/sections/TestimonialFeature/TestimonialFeature';
import { ctaBanner, goodCompany, sectionIds, testimonial, whyPartner } from './partnersData';
import { usePageEntrance } from '@/hooks/usePageEntrance';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pageMeta } from '@/config/seo';

const Partners = () => {
  useDocumentMeta(pageMeta.partners);

  const entrance = usePageEntrance('partners');

  return (
    <div className={styles.partnersPage}>
      <PartnersHero entrance={entrance} />
      <div className={styles.container}>
        <PartnerPrograms />
        <CyclingCards {...whyPartner} />
        <LogoGrid {...goodCompany} />
        <TestimonialFeature {...testimonial} />
      </div>
      <CtaBanner variant="lime" id={sectionIds.registerDeal} {...ctaBanner} />
    </div>
  );
};

export default Partners;
