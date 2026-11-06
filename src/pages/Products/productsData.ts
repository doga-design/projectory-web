import type { ObjectiveAccent } from './components/ObjectiveFilter/ObjectiveFilter';

/* The objective filters, A–Z. All Products must stay first: it's the default. `value` is what the URL and each
   product's `tags` use (the footer links to these too); `label` is shown. `accent` is the brand colour
   the filter fills with when it's selected: teal is All Products' alone, and the objectives take the other
   three brand accents (coral, lime, pink) in turn. */
export const productTags = [
  {
    value: 'All Products',
    accent: 'teal',
    label: 'All Products',
    description:
      'Explore everything or filter by objective to find products designed with your goals in mind.',
  },
  {
    value: 'Build alignment',
    accent: 'coral',
    label: 'Build Alignment',
    description:
      'Engage participants in collaborative processes that surface diverse viewpoints while building shared vision, commitment, and momentum.',
  },
  {
    value: 'Explore priorities',
    accent: 'lime',
    label: 'Explore Priorities',
    description:
      'Guide participants through focused discussions that surface key challenges, consider multiple perspectives, and clarify decision-making around strategic goals',
  },
  {
    value: 'Ideas to action',
    accent: 'pink',
    label: 'Ideas to Action',
    description:
      'Translate insights and inspiration into tangible next steps by helping participants co-create actionable plans they can implement immediately.',
  },
  {
    value: 'Inspire creativity',
    accent: 'coral',
    label: 'Inspire Creativity',
    description:
      'Spark new ideas and bold questions through engaging experiences that challenge assumptions and encourage innovative approaches to future challenges.',
  },
  {
    value: 'Networking',
    accent: 'lime',
    label: 'Networking',
    description:
      'Create meaningful opportunities for participants to build relationships, exchange ideas, and grow professional networks that extend beyond the event.',
  },
  {
    value: 'Peer learning',
    accent: 'pink',
    label: 'Peer Learning',
    description:
      'Encourage open, insightful conversations among peers to share experiences, deepen understanding, and elevate collective expertise.',
  },
  {
    value: 'Reflect & synthesize',
    accent: 'coral',
    label: 'Reflect & Synthesize',
    description:
      'Encourage participants to pause, integrate insights, and identify key takeaways that reinforce learning and support overall program objectives.',
  },
  {
    value: 'Visualize insights',
    accent: 'lime',
    label: 'Visualize Insights',
    description:
      'Create collaborative, tactile data visualizations that capture participant contributions while crystallizing key themes and building shared understanding.',
  },
] satisfies { value: string; accent: ObjectiveAccent; label: string; description: string }[];

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
