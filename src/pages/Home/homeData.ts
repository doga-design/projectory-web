const REEL_ID = 'v1769443947/Projectory_LandingVideo_t4wkon';

export const hero = {
  titleLines: ['Less Talking Heads,', 'More Heads Talking'],
  description:
    'Bringing bold ideas to life — transforming events into immersive, unforgettable moments.',
  primaryCta: { label: 'Get Started', to: '/get-started' },
  secondaryCta: { label: 'Explore Products', to: '/products#tagContent' },
  reelSrc: `https://res.cloudinary.com/dazzkestf/video/upload/q_auto/${REEL_ID}.mp4`,
  /* First frame while the MP4 loads. Also preloaded in index.html; keep the URLs in sync. */
  reelPoster: `https://res.cloudinary.com/dazzkestf/video/upload/so_0,f_jpg,q_auto,w_1920/${REEL_ID}.jpg`,
};

export const statementLines = [
  'Event attendees don’t want to just sit and listen.',
  'Forget stretch breaks and unstructured happy hours.',
  'Attendees want more meaningful interactions,',
  'deeper connections, and better conversations.',
  'They want real engagement – and more of it.',
  'The future of events is clearly experiential.',
  'We’re here to create it with you. Now.',
];
