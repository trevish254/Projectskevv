# Project instructions

  Build the site design-first.

  Use the completed Projects detail page as the primary visual reference.

  Do not connect CMS data until the layouts are complete with realistic placeholder content.

  Projects and Services must share:
  - Design tokens
  - Responsive breakpoints
  - Layout primitives
  - Animation utilities
  - Media components
  - Metadata components
  - CTA components

  Projects and Services must not be forced into the exact same page composition.

  Projects:
  hero → metadata → media → description → related projects → CTA

  Services:
  hero → overview → capabilities/process → supporting media → related services → CTA

  Always verify desktop, tablet, and mobile layouts.

  Before changing code:
  - Inspect existing files
  - Preserve working behavior
  - Avoid duplicating page logic
  - Use reusable components
  - Keep CMS mapping separate from presentation

  After changing code:
  - Run lint
  - Run type-check
  - Run tests
  - Start the dev server
  - Verify the affected page in the browser
