import type { ChipAccent } from './components/CatalogueChips/CatalogueChips';

/* The objective filters, in display order. `value` is what the URL and each
   product's `tags` use (the footer links to these too); `label` is shown. */
export const productTags = [
  {
    value: 'All Products',
    accent: 'white',
    label: 'All Products',
    description:
      'Explore everything or filter by objective to find products designed with your goals in mind.',
  },
  {
    value: 'Networking',
    accent: 'teal',
    label: 'Networking',
    description:
      'Create meaningful opportunities for participants to build relationships, exchange ideas, and grow professional networks that extend beyond the event.',
  },
  {
    value: 'Peer learning',
    accent: 'yellow',
    label: 'Peer Learning',
    description:
      'Encourage open, insightful conversations among peers to share experiences, deepen understanding, and elevate collective expertise.',
  },
  {
    value: 'Explore priorities',
    accent: 'pink',
    label: 'Explore Priorities',
    description:
      'Guide participants through focused discussions that surface key challenges, consider multiple perspectives, and clarify decision-making around strategic goals',
  },
  {
    value: 'Ideas to action',
    accent: 'coral',
    label: 'Ideas to Action',
    description:
      'Translate insights and inspiration into tangible next steps by helping participants co-create actionable plans they can implement immediately.',
  },
  {
    value: 'Reflect & synthesize',
    accent: 'yellow',
    label: 'Reflect & Synthesize',
    description:
      'Encourage participants to pause, integrate insights, and identify key takeaways that reinforce learning and support overall program objectives.',
  },
  {
    value: 'Build alignment',
    accent: 'teal',
    label: 'Build Alignment',
    description:
      'Engage participants in collaborative processes that surface diverse viewpoints while building shared vision, commitment, and momentum.',
  },
  {
    value: 'Inspire creativity',
    accent: 'pink',
    label: 'Inspire Creativity',
    description:
      'Spark new ideas and bold questions through engaging experiences that challenge assumptions and encourage innovative approaches to future challenges.',
  },
  {
    value: 'Visualize insights',
    accent: 'coral',
    label: 'Visualize Insights',
    description:
      'Create collaborative, tactile data visualizations that capture participant contributions while crystallizing key themes and building shared understanding.',
  },
] satisfies { value: string; accent: ChipAccent; label: string; description: string }[];

/* The two cards under the grid: a custom product (coral) and the Product Finder (teal). */
export const ctaPair = [
  {
    accent: 'coral',
    title: 'Looking to meet a\nspecific objective?',
    body: 'We’ll work with you to create a custom product that aligns with your event’s needs. Get in touch to learn more.',
    button: { label: 'Contact Us', to: '/get-started#contact-form' },
  },
  {
    accent: 'teal',
    title: 'Don’t Know\nWhere To Start',
    body: 'Use this simple tool to quickly match your event with the best mix of experiences.',
    button: { label: 'Product Finder', to: '/get-started-form' },
  },
] as const;

/* The section after the CTA cards. The study's own copy comes from caseStudiesData. */
export const featuredStudy = {
  eyebrow: 'Featured Case Study',
  title: 'Explore How Our\nProducts Re-shape\nExperiences',
  titleWide: 'Explore How Our Products\nRe-shape Experiences',
  cta: { label: 'Explore All Case Studies', to: '/case-studies' },
  studyId: 'cibc-global-leadership-summit',
  image:
    'https://res.cloudinary.com/dazzkestf/image/upload/f_auto,q_auto/v1749518972/FM8A5043-Enhanced-NR_qywkjc_vydjdi.webp',
};
