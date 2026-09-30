// Per-route document metadata.
//
// Copy here is taken from what each page actually says on screen (hero
// headings, hero descriptions, the footer tagline) rather than invented, so
// search results match the page a visitor lands on.

// Deliberately absent: og:image — there is no 1200x630 brand asset in the repo,
// and the logos are SVGs, which social platforms do not render.

export const SITE_NAME = 'Projectory';

/**
 * Canonical origin: apex host, no www, no trailing slash.
 */
export const SITE_URL = 'https://projectory.live';

export const DEFAULT_DESCRIPTION =
  'Projectory transforms half-listening event attendees into an engaged cohort of active, connected participants.';

export interface PageMeta {
  /** Page-specific part of the title. Omit on the home page. */
  title?: string;
  description: string;
}

export const pageMeta = {
  home: {
    description: DEFAULT_DESCRIPTION,
  },
  products: {
    title: 'Products',
    description:
      'Facilitated sessions and interactive installations that turn event attendees into active, connected participants.',
  },
  caseStudies: {
    title: 'Case Studies',
    description:
      'Explore how our projects redefine interactive experiences and create lasting impacts.',
  },
  pricing: {
    title: 'Pricing',
    description:
      'Every product, one price. Rent and run it with your team, or bring us in to facilitate.',
  },
  partners: {
    title: 'Partners',
    description:
      'Now that you’re here, let’s add unforgettable audience engagement to your next client’s event.',
  },
  whoWeAre: {
    title: 'Who We Are',
    description:
      'Meet the founders behind Projectory and why we started the audience engagement company.',
  },
  getStarted: {
    title: 'Get Started',
    description:
      'Tell us about your event and we will highlight the products worth adding to your program.',
  },
  getStartedForm: {
    title: 'Product Finder',
    description:
      'Answer a few questions and we will recommend the Projectory products that fit your event.',
  },
  getEstimate: {
    title: 'Get an Estimate',
    description:
      'Share a few details about your event and we will follow up with an estimate for your selected products.',
  },
} satisfies Record<string, PageMeta>;
