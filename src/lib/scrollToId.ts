/** Smooth-scroll to an in-page section by id, without touching the URL. */
export const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
