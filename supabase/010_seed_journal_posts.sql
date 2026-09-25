-- One-time journal seed for the Projectskevv CMS.
-- Cover and author image URLs are intentionally null so they can be added in the CMS.

insert into public.journal_posts (
  title,
  slug,
  status,
  description,
  content_html,
  cover_image_url,
  tag,
  minutes_read,
  author_name,
  author_role,
  author_image_url,
  published_at
)
values
(
  'A Brand System Should Make Decisions Easier',
  'a-brand-system-should-make-decisions-easier',
  'published',
  'A useful identity does more than look consistent. It gives a team a clearer way to choose, edit, and move forward.',
  '<p>A brand system earns its place when it helps people make better decisions with less hesitation. The logo matters, but it is rarely the part of the system that a team uses most often. The real work lives in the relationships between type, color, image direction, motion, language, and layout.</p><p>Strong systems create a small set of recognizable choices without making every output identical. They give a campaign room to be expressive while keeping the underlying point of view intact.</p><h2>THE SYSTEM IS A SET OF RELATIONSHIPS</h2><p>Rather than collecting isolated assets, we look for the rules connecting them. How much tension can the typography hold? When should an image feel quiet or direct? Which details are essential, and which can change from one context to the next?</p><p>When those questions are answered clearly, the brand becomes easier to use. A small team can brief a photographer, build a landing page, or prepare a social post without starting from zero every time.</p><h2>FLEXIBILITY NEEDS BOUNDARIES</h2><p>Freedom without a point of view quickly becomes visual noise. The best systems define a few non-negotiables, then leave enough space for judgment. That balance is what lets a brand stay coherent as the work changes.</p>',
  null,
  'BRANDING',
  5,
  'PROJECTSKEVV EDITORIAL',
  'Creative studio',
  null,
  timezone('utc', now()) - interval '3 days'
),
(
  'Art Direction Begins Before the First Image',
  'art-direction-begins-before-the-first-image',
  'published',
  'The strongest visual direction is usually decided in the questions asked before a camera, layout, or production schedule enters the room.',
  '<p>Art direction is often described through its visible output: the frame, the palette, the styling, the finished composition. But the most important choices usually happen earlier, when the team decides what the work needs to make someone feel, understand, or remember.</p><p>Before collecting references, we define the central tension. Is the work polished but human? Precise but atmospheric? Familiar with one unexpected element? A clear tension gives every later decision something to answer to.</p><h2>REFERENCES ARE NOT A DIRECTION</h2><p>A moodboard can show a tone, but it cannot replace a point of view. We use references to identify qualities, not to borrow solutions. The useful question is not “Can we make it look like this?” but “What is this image doing that our work needs to do too?”</p><h2>DETAILS SHOULD SERVE THE IDEA</h2><p>Location, casting, props, lighting, crop, and retouching all carry meaning. When those decisions are made as one conversation, the final images feel intentional rather than decorated. The result is not simply a collection of attractive frames. It is a visual language that can hold together across a campaign, a site, and the moments in between.</p>',
  null,
  'ART DIRECTION',
  4,
  'PROJECTSKEVV EDITORIAL',
  'Creative studio',
  null,
  timezone('utc', now()) - interval '6 days'
),
(
  'Designing Digital Spaces with a Sense of Place',
  'designing-digital-spaces-with-a-sense-of-place',
  'published',
  'A digital experience can feel located and memorable when its structure, materials, and rhythm are treated as part of the story.',
  '<p>Digital spaces do not have to feel weightless. The way a page moves, holds an image, introduces a piece of information, or leaves room around a sentence can suggest a distinct sense of place.</p><p>That feeling does not come from decoration alone. It begins with structure: what deserves attention first, how a visitor moves through the work, and where the experience should slow down. Visual material then reinforces those decisions through scale, texture, contrast, and motion.</p><h2>RHYTHM IS PART OF THE IDENTITY</h2><p>A site can be quiet without being empty. A measured sequence of dense and open sections gives the eye a way to travel. Small changes in pace can make a portfolio feel more like an edited body of work than a stack of interchangeable screens.</p><h2>MAKE ROOM FOR THE WORK</h2><p>The interface should frame the content without competing with it. Clear navigation, purposeful transitions, and resilient responsive layouts make the experience feel considered. The goal is not to make a digital space imitate a physical one. It is to give the visitor the same sense of orientation and character that a well-made physical environment can provide.</p>',
  null,
  'DIGITAL',
  5,
  'PROJECTSKEVV EDITORIAL',
  'Creative studio',
  null,
  timezone('utc', now()) - interval '9 days'
),
(
  'The Photograph Is Part of the Brand, Not a Placeholder',
  'the-photograph-is-part-of-the-brand-not-a-placeholder',
  'published',
  'Photography carries a point of view long before a visitor reads the caption. Treating it as a core brand decision makes the whole system more distinctive.',
  '<p>Photography is often brought into a project at the end, after the identity and interface have already been decided. That approach misses how much an image can shape perception. Light, distance, gesture, surface, and timing all tell people what kind of brand they are looking at.</p><p>A useful image direction starts with behavior rather than a list of visual effects. Should the camera observe or participate? Should the subject feel composed or caught? Should the frame reveal context or remove it?</p><h2>CONSISTENCY DOES NOT MEAN REPETITION</h2><p>A photography system can be recognizable without forcing every image through the same treatment. Consistency might live in the way subjects are found, the honesty of the light, the amount of space left around a gesture, or the decision to show the imperfect edge.</p><h2>IMAGE-MAKING IS STRATEGIC WORK</h2><p>When photography is considered alongside type and layout, it becomes more than a source of decoration. It becomes a way to express the brand''s attitude in a single frame. That is why the strongest image libraries feel edited, specific, and capable of carrying meaning on their own.</p>',
  null,
  'PHOTOGRAPHY',
  4,
  'PROJECTSKEVV EDITORIAL',
  'Creative studio',
  null,
  timezone('utc', now()) - interval '12 days'
)
on conflict (slug) do nothing;