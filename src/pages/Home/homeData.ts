import { apricot } from '@/assets/images/shapes/floaters';
import cibc from '@/assets/images/logos/cibc.webp';
import oracle from '@/assets/images/logos/oracle.webp';
import thomsonReuters from '@/assets/images/logos/thomsonReuters.webp';
import canadianMedicalAssociation from '@/assets/images/logos/canadianMedicalAssociation.webp';
import pcma from '@/assets/images/logos/pcma.webp';
import royalCanadianMint from '@/assets/images/logos/royalCanadianMint.svg';
import deloitte from '@/assets/images/logos/deloitte.webp';
import type { Logo } from '@/components/LogoMarquee/LogoMarquee';

export const statementLines = [
  'Event attendees don’t want to just sit and listen.',
  'Forget stretch breaks and unstructured happy hours.',
  'Attendees want more meaningful interactions,',
  'deeper connections, and better conversations.',
  'They want real engagement – and more of it.',
  'The future of events is clearly experiential.',
  'We’re here to create it with you. Now.',
];

export const whatWeDo = {
  eyebrow: 'What We Do',
  title: 'Interactive. Integrated.\nUnexpected.',
  body: 'Projectory creates tangible, data-rich experiences that enhance in-person events, helping organizers extend the value of their programs and make info-dense events, well, less boring. Find some of our featured products below, or explore all of them in depth.',
  cta: { label: 'Explore All Products', to: '/products#tagContent' },
};

export const brands = {
  title: 'Brands we’ve built\nexperiences with',
  logos: [
    { src: cibc, alt: 'CIBC' },
    { src: oracle, alt: 'Oracle' },
    { src: thomsonReuters, alt: 'Thomson Reuters' },
    { src: canadianMedicalAssociation, alt: 'Canadian Medical Association' },
    { src: pcma, alt: 'PCMA' },
    { src: royalCanadianMint, alt: 'Royal Canadian Mint' },
    { src: deloitte, alt: 'Deloitte' },
  ] satisfies Logo[],
};

export const testimonial = {
  videoSrc:
    'https://res.cloudinary.com/dazzkestf/video/upload/q_auto/v1749521688/Website_Testimonials_Dec_2024_V4_jsyqfo_mb8c7q.mp4',
  poster:
    'https://res.cloudinary.com/dazzkestf/video/upload/so_0,f_jpg,q_auto/v1749521688/Website_Testimonials_Dec_2024_V4_jsyqfo_mb8c7q.jpg',
  quote:
    '“Projectory helped bring our conference to life. As soon as I heard they took the analog experience and could make it read out results for us, I was blown away.”',
  name: 'Sandy Sharman',
  role: 'Group Head, People Culture & Brand, CIBC',
  floater: apricot,
  layout: 'offset',
  accent: 'coral',
} as const;

export const yawnProof = {
  title: 'Yawn-Proof Your Events.',
  body: 'Projectory turns half-listening attendees into active participants – the kind who engage with your content, make valuable connections, contribute to the conversation, and take responsibility for real next steps.',
  cta: { label: 'Get Started', to: '/get-started' },
};
