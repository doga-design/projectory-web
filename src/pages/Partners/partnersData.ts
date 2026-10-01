import type { Logo } from '@/components/LogoMarquee/LogoMarquee';
import type { FeatureCardProps } from '@/components/FeatureCard/FeatureCard';
import type { CyclingCardsItem } from '@/components/sections/CyclingCards/CyclingCards';
import cvent from '@/assets/images/logos/cvent.svg';
import sonar from '@/assets/images/logos/sonar.svg';
import pcma from '@/assets/images/logos/pcma.svg';
import opus from '@/assets/images/logos/opus.svg';
import rainFocus from '@/assets/images/logos/rainFocus.svg';
import shepard from '@/assets/images/logos/shepard.svg';
import cema from '@/assets/images/logos/cema.svg';
import loma from '@/assets/images/logos/loma.svg';

/* In-page scroll targets for the hero and program card CTAs. */
export const sectionIds = {
  programs: 'partner-programs',
  registerDeal: 'register-deal',
};

export const partnersHero = {
  eyebrow: 'Projectory Partner Network',
  title: 'Your Partners\nin Engagement',
  body: 'The Projectory Partner Network is for planners,\n agencies, and event organizers who wish to add\naudience engagement to their client’s events.',
  cta: { label: 'Join the network', scrollTo: sectionIds.programs },
};

/* The page's logos: the band under the hero and "In Good Company". Add or remove a logo
   here; list order is scroll and grid order. */
const partnerLogos = [
  { src: cvent, alt: 'Cvent' },
  { src: sonar, alt: 'Sonar' },
  { src: pcma, alt: 'PCMA' },
  { src: opus, alt: 'Opus' },
  { src: rainFocus, alt: 'RainFocus' },
  { src: shepard, alt: 'Shepard' },
  { src: cema, alt: 'CEMA' },
  { src: loma, alt: 'Loma Agency' },
] satisfies Logo[];

export const clientLogos = partnerLogos;

/* The program cards; each card's Apply opens the application overlay on that program. */
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
      body: 'We build and pitch the deal together. You choose how to handle the pricing.',
      features: [
        'A 30% exclusive discount to mark up or pass through.',
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
        'Up to 70% off our rates.',
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

export const goodCompany = {
  title: 'In Good Company',
  logos: partnerLogos,
};

export const testimonial = {
  videoSrc:
    'https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1790870122/CVENT_Testimonial_Sizzle_for_Web_V1_cyyxer.mp4',
  poster:
    'https://res.cloudinary.com/dazzkestf/video/upload/so_0,f_jpg,q_auto/v1790870122/CVENT_Testimonial_Sizzle_for_Web_V1_cyyxer.jpg',
  quote:
    '“Projectory was able to take us to a new level and bring a fun and interactive experience to our partners.”',
  name: 'Denise Sutter',
  role: 'Channel Marketing Manager, Cvent',
};

export const ctaBanner = {
  title: 'Ready to Apply?\nRegister a Deal.',
  body: 'Your client stays yours. Register it and we’ll protect the dates, even if the event is months away.',
  primary: { label: 'Register a Deal', scrollTo: sectionIds.programs },
};
