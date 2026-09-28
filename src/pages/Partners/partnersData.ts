import type { Logo } from '@/components/LogoMarquee/LogoMarquee';
import type { FeatureCardProps } from '@/components/FeatureCard/FeatureCard';
import type { CyclingCardsItem } from '@/components/sections/CyclingCards/CyclingCards';
import cibc from '@/assets/images/logos/cibc.webp';
import oracle from '@/assets/images/logos/oracle.webp';
import thomsonReuters from '@/assets/images/logos/thomsonReuters.webp';
import canadianMedicalAssociation from '@/assets/images/logos/canadianMedicalAssociation.webp';
import pcma from '@/assets/images/logos/pcma.webp';
import royalCanadianMint from '@/assets/images/logos/royalCanadianMint.svg';
import deloitte from '@/assets/images/logos/deloitte.webp';
import enmax from '@/assets/images/logos/enmax.webp';

/* In-page scroll targets for the hero and program card CTAs. */
export const sectionIds = {
  programs: 'partner-programs',
  registerDeal: 'register-deal',
};

export const partnersHero = {
  eyebrow: 'Projectory Partner Network',
  title: 'Your Partners\nin Engagement',
  body: 'We’ll get the room talking.\nYou focus on everything else.',
  cta: { label: 'Join the network', scrollTo: sectionIds.programs },
};

/* Logo band under the hero. Add or remove a logo here; list order is scroll order. */
export const clientLogos = [
  { src: cibc, alt: 'CIBC' },
  { src: oracle, alt: 'Oracle' },
  { src: thomsonReuters, alt: 'Thomson Reuters' },
  { src: canadianMedicalAssociation, alt: 'Canadian Medical Association' },
  { src: pcma, alt: 'PCMA Foundation' },
  { src: royalCanadianMint, alt: 'Royal Canadian Mint' },
  { src: deloitte, alt: 'Deloitte' },
  { src: enmax, alt: 'ENMAX' },
] satisfies Logo[];

const apply = { label: 'Apply', scrollTo: sectionIds.registerDeal };

export const partnerPrograms = {
  eyebrow: 'Find your fit, and we’ll get to work',
  title: 'Great Events,\nBuilt Together',
  cards: [
    {
      accent: 'coral',
      title: 'Refer',
      caption: 'Freelancers and independent planners',
      body: 'Know someone who’d love us? Make the intro and we’ll get them excited.',
      features: [
        'A 10% referral fee on every booking',
        'Set the meeting, and we’ll do the talking.',
        'Keep earning on repeat bookings.',
      ],
      cta: apply,
    },
    {
      accent: 'teal',
      title: 'Resell',
      caption: 'Consultants, agencies, production companies',
      body: 'We build and pitch the deal together. You choose how to handle the pricing.',
      features: [
        'A 30% exclusive discount to mark up or pass through.',
        'Full sales support, from the first call to signing.',
        'Ready materials for your RFPs and proposals.',
      ],
      cta: apply,
    },
    {
      accent: 'lime',
      title: 'Trade',
      caption: 'Organizers of event industry gatherings.',
      body: 'When your audience is planners, we’ll make it worth showing off.',
      features: [
        'Up to 70% off our rates.',
        'First access to our newest and debut products.',
        'Add to sponsorship packages and other show elements.',
      ],
      cta: apply,
    },
  ] satisfies FeatureCardProps[],
};

export const whyPartner = {
  eyebrow: 'What’s in it for you?',
  title: 'Why Partner\nWith Us?',
  items: [
    {
      title: 'Win more work.',
      body: 'Your clients are already asking for something more engaging and creative. Now you have the answer to walk in with.',
    },
    {
      title: 'Press the easy button.',
      body: 'Decks, one-pagers, RFP-ready materials, case studies and budget options, ready to drop into your proposals. We can join calls and pitch right alongside you.',
    },
    {
      title: 'Be the hero in the room.',
      body: 'Every product started as a client brief. If your client has a unique challenge, bring us in and we’ll put our heads together.',
    },
    {
      title: 'Proven with tough rooms.',
      body: 'From banks and Fortune 500 teams to famously reserved audiences, the toughest rooms leaned in. You’re recommending something that works.',
    },
  ] satisfies CyclingCardsItem[],
};

export const goodCompany = {
  title: 'In Good Company',
  logos: [
    { src: cibc, alt: 'CIBC' },
    { src: oracle, alt: 'Oracle' },
    { src: thomsonReuters, alt: 'Thomson Reuters' },
    { src: canadianMedicalAssociation, alt: 'Canadian Medical Association' },
    { src: pcma, alt: 'PCMA Foundation' },
    { src: royalCanadianMint, alt: 'Royal Canadian Mint' },
    { src: deloitte, alt: 'Deloitte' },
  ] satisfies Logo[],
};

export const testimonial = {
  videoSrc:
    'https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1770743158/RampUp_Sizzle_h1eqb9.mp4',
  poster:
    'https://res.cloudinary.com/dazzkestf/video/upload/so_0,f_jpg,q_auto/v1770743158/RampUp_Sizzle_h1eqb9.jpg',
  quote:
    '“Projectory was able to take us to a new level and bring a fun and interactive experience to our partners.”',
  name: 'Denise Sutter',
  role: 'Channel Marketing Manager, Cvent',
};

export const ctaBanner = {
  title: 'Ready to Apply?\nRegister a Deal.',
  body: 'Your client stays yours. Register it and we’ll protect the dates, even if the event is months away.',
  primary: { label: 'Register a Deal', to: '/get-started#contact-form' },
};
