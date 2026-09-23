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

export const partnersHero = {
  title: 'Welcome, Partner',
  body: 'Now that you’re here, let’s add unforgettable\naudience engagement to your next client’s event.',
  cta: { label: 'Become a Partner', to: '/get-started#contact-form' },
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

const learnMore = { label: 'Learn More', to: '/get-started#contact-form' };

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
        'A 5 to 10% referral fee on every booking.',
        'Set the meeting, and we’ll do the talking.',
        'Keep earning on repeat bookings.',
      ],
      cta: learnMore,
    },
    {
      accent: 'teal',
      title: 'Resell',
      caption: 'Consultants, agencies, production companies',
      body: 'We build and pitch the deal together. You choose how to handle the pricing.',
      features: [
        '15 to 20% partner pricing, to mark up or pass through.',
        'Full sales support, from the first call to signing.',
        'Ready materials for your RFPs and proposals.',
      ],
      cta: learnMore,
    },
    {
      accent: 'lime',
      title: 'Trade',
      caption: 'Event organizers and networks whose audience is planners',
      body: 'When your audience is planners, we’ll make it worth showing off.',
      features: [
        'Up to 70% off our rates.',
        'First access to our newest and debut products.',
        'Add to sponsorship packages and other show elements.',
        'Multi-year options.',
      ],
      cta: learnMore,
    },
  ] satisfies FeatureCardProps[],
};

export const whyPartner = {
  eyebrow: 'What’s in it for us?',
  title: 'Why Partner\nWith Us?',
  items: [
    {
      title: 'Win more work.',
      body: 'Your clients are already asking for something more engaging and creative. Now you have the answer to walk in with.',
    },
    {
      title: 'It plugs into how you already sell.',
      body: 'Decks, RFP-ready materials, case studies, and budget options, ready to drop straight into your proposals. And you don’t need to be the expert, we’ll join your calls and pitch right alongside you.',
    },
    {
      title: 'Be the hero in the room.',
      body: 'Every product started as a client brief, so if your client has a unique challenge, we’ll get to work. Run it with our guides and videos, or bring us in. Either way, your client will be glad you brought this up.',
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
    '“Projectory did an amazing job. Getting us moving, talking, and having fun, while focused on business results. Loved it!”',
  name: 'Sandra Rondzik',
  role: 'Group Head, People Culture & Brand, CIBC',
};

export const ctaBanner = {
  title: 'Have a Client in Mind?\nRegister It.',
  body: 'Even if it’s months away. We’ll protect the\ndates and wait for your sign.',
  primary: { label: 'Register a Deal', to: '/get-started#contact-form' },
};
