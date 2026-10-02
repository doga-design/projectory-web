import type { Logo } from '@/components/LogoMarquee/LogoMarquee';
import type { FeatureCardProps } from '@/components/FeatureCard/FeatureCard';
import type { CyclingCardsItem } from '@/components/sections/CyclingCards/CyclingCards';
import cvent from '@/assets/images/logos/partners-hero/cvent.svg';
import sonar from '@/assets/images/logos/sonar.svg';
import pcma from '@/assets/images/logos/partners-hero/pcma.svg';
import opus from '@/assets/images/logos/partners-hero/opus.svg';
import rainFocus from '@/assets/images/logos/partners-hero/rainFocus.svg';
import shepard from '@/assets/images/logos/partners-hero/shepard.svg';
import gpj from '@/assets/images/logos/partners-hero/gpj.svg';
import clubIchi from '@/assets/images/logos/partners-hero/clubIchi.svg';
import mig from '@/assets/images/logos/partners-hero/mig.svg';
import cema from '@/assets/images/logos/partners-good-company/cema.svg';
import loma from '@/assets/images/logos/partners-good-company/loma.svg';
import destinationCleveland from '@/assets/images/logos/partners-good-company/destinationCleveland.svg';
import destinationToronto from '@/assets/images/logos/partners-good-company/destinationToronto.svg';
import eventMarketer from '@/assets/images/logos/partners-good-company/eventMarketer.svg';
import txg from '@/assets/images/logos/partners-good-company/txg.svg';

/* In-page scroll targets for the hero and program card CTAs. */
export const sectionIds = {
  programs: 'partner-programs',
  registerDeal: 'register-deal',
};

export const partnersHero = {
  eyebrow: 'Projectory Partner Network',
  title: 'Your Partners\nin Engagement',
  body: 'The Projectory Partner Network is for planners, agencies and event organizers who wish to add audience engagement to their clients’ events.',
  cta: { label: 'Join the network', scrollTo: sectionIds.programs },
};

/* The band under the hero. Its own set (partners-hero/), separate from "In Good Company";
   list order is scroll order. */
export const heroLogos = [
  { src: cvent, alt: 'Cvent' },
  { src: sonar, alt: 'Sonar' },
  { src: pcma, alt: 'PCMA' },
  { src: opus, alt: 'Opus' },
  { src: rainFocus, alt: 'RainFocus' },
  { src: shepard, alt: 'Shepard' },
  { src: gpj, alt: 'George P. Johnson' },
  { src: clubIchi, alt: 'Club Ichi' },
  { src: mig, alt: 'MIG' },
] satisfies Logo[];

/* The program cards; each card's "Learn more" opens the enquiry overlay on that program. */
export type PartnerProgram = 'Refer' | 'Resell' | 'Trade';

export const partnerPrograms = {
  eyebrow: 'Find your fit, and let’s get to work',
  title: 'Great Events,\nBuilt Together',
  cards: [
    {
      accent: 'coral',
      title: 'Refer',
      caption: 'Freelancers and independent planners',
      body: 'Know someone who’d love us?\nMake the intro and let us wow them.',
      features: [
        'A 10% referral fee on every booking',
        'Set the meeting, and we’ll get them excited',
        'Keep earning on repeat bookings.',
      ],
    },
    {
      accent: 'teal',
      title: 'Resell',
      caption: 'Consultants, agencies, production companies',
      body: 'You own the client relationship. We’ll partner to build and pitch together.',
      features: [
        'A 30% discounted partner rate to mark up or pass through.',
        'Full sales support, from the first call to signing.',
        'Ready materials for your RFPs and proposals.',
      ],
    },
    {
      accent: 'lime',
      title: 'Trade',
      caption: 'Organizers of event industry gatherings.',
      body: 'When your audience is planners, we’ll make it worth showing off.',
      features: [
        'Up to 70% off, in exchange for visibility with your audience.',
        'First access to our newest and debut products.',
        'Add to sponsorship packages and other show elements.',
      ],
    },
  ] satisfies (Omit<FeatureCardProps, 'cta'> & { title: PartnerProgram })[],
  /* Muted note under the cards; `link` is appended to the second line. */
  note: {
    lines: [
      'Partner rates apply to engagements booked through our Partner Network.',
      'Booking for your own event? See our',
    ],
    link: { label: 'standard pricing', to: '/pricing' },
  },
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

/* Its own set (partners-good-company/), separate from the hero band; list order is grid order. */
export const goodCompany = {
  title: 'In Good Company',
  logos: [
    { src: cema, alt: 'CEMA' },
    { src: loma, alt: 'Loma Agency' },
    { src: destinationCleveland, alt: 'Destination Cleveland' },
    { src: destinationToronto, alt: 'Destination Toronto' },
    { src: eventMarketer, alt: 'Event Marketer' },
    { src: txg, alt: 'TXG, The Experiential Group' },
  ] satisfies Logo[],
};

export const testimonial = {
  videoSrc:
    'https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1790961537/CVENT_Testimonial_Sizzle_for_Web_V2_di4dvr.mp4',
  poster:
    'https://res.cloudinary.com/dazzkestf/video/upload/so_0,f_jpg,q_auto/v1790961537/CVENT_Testimonial_Sizzle_for_Web_V2_di4dvr.jpg',
  quote:
    '“Projectory was able to take us to a new level and bring a fun and interactive experience to our partners.”',
  name: 'Denise Sutter',
  role: 'Channel Marketing Manager, Cvent',
};

export const ctaBanner = {
  title: 'Which dates should we\nhold for your client?',
  body: 'Even if it’s months away. We’ll protect\nthe dates and wait for your sign.',
  primary: { label: 'Hold the Dates', scrollTo: sectionIds.programs },
};
