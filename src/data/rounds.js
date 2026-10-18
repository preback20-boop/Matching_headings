// Keep IDs stable. Increment revision whenever wording or answer keys change.
// These are original practice passages, not official IELTS exam material.
export const rounds = [
  {
    id: 'round-1', revision: 1, label: 'Round 1', title: 'A city beneath the trees',
    topic: 'ENVIRONMENT & DESIGN', suggestedMinutes: 8,
    description: 'How urban trees became part of a city’s essential infrastructure.',
    paragraphs: [
      { id: 'A', text: 'For many years, street trees appeared near the end of a city planner’s checklist. They were selected mainly to make a new road look attractive. Today, some planners begin with the trees instead. They treat the urban canopy as a working system, alongside drainage and transport, and reserve space for it before drawing the buildings.' },
      { id: 'B', text: 'On a sunny day, a tree changes the conditions around it in two ways. Its crown blocks sunlight from reaching the pavement, while water released through its leaves helps cool the surrounding air. A narrow strip of grass cannot provide the same overhead shade. The benefit is therefore especially noticeable along streets where people walk or wait for buses.' },
      { id: 'C', text: 'Yet a large crown depends on something pedestrians rarely see: room for roots. Trees planted in tiny openings may survive their first few seasons but struggle as they grow. Compacted soil and underground pipes restrict their development. Some cities now connect planting spaces beneath the pavement, giving roots a larger area without taking the entire footpath away from people.' },
      { id: 'D', text: 'The work does not end when a young tree is planted. During its first summers, reliable watering can matter more than the ceremony that marked its arrival. Neighbourhood groups sometimes adopt newly planted trees and report damaged supports or dry soil. Such schemes give residents a practical role in caring for a shared resource, while trained staff remain responsible for specialist work.' },
      { id: 'E', text: 'Counting how many trees were planted in a year offers a simple headline, but it can hide disappointing results. If many of those trees die, the number says little about the shade a street will eventually receive. A more useful assessment follows survival, canopy growth and the distribution of shade across neighbourhoods. Success becomes something measured over years, rather than on planting day.' },
    ],
    headings: [
      { id: 'i', text: 'The hidden space that healthy growth requires' },
      { id: 'ii', text: 'Why residents oppose new planting schemes' },
      { id: 'iii', text: 'A change from decoration to essential planning' },
      { id: 'iv', text: 'Looking beyond the number planted' },
      { id: 'v', text: 'Two ways of making a street cooler' },
      { id: 'vi', text: 'The role of local people in ongoing care' },
      { id: 'vii', text: 'Replacing every road with green space' },
    ],
    questions: [
      { id: 'q1', paragraphId: 'A', text: 'Choose the best heading for paragraph A.', correctHeadingId: 'iii', explanation: 'The whole paragraph contrasts trees as decoration with trees as a system considered early in planning.' },
      { id: 'q2', paragraphId: 'B', text: 'Choose the best heading for paragraph B.', correctHeadingId: 'v', explanation: 'Shade and the release of water are the two cooling mechanisms. Walking and buses are examples of where they help.' },
      { id: 'q3', paragraphId: 'C', text: 'Choose the best heading for paragraph C.', correctHeadingId: 'i', explanation: 'The central issue is underground space for roots; the connected planting spaces are a solution to that issue.' },
      { id: 'q4', paragraphId: 'D', text: 'Choose the best heading for paragraph D.', correctHeadingId: 'vi', explanation: 'Watering, adopting trees and reporting problems all illustrate residents’ involvement after planting.' },
      { id: 'q5', paragraphId: 'E', text: 'Choose the best heading for paragraph E.', correctHeadingId: 'iv', explanation: 'The paragraph argues for measuring survival, growth and shade instead of relying only on planting totals.' },
    ],
  },
  {
    id: 'round-2', revision: 1, label: 'Round 2', title: 'The return of repair',
    topic: 'COMMUNITIES & CHANGE', suggestedMinutes: 8,
    description: 'What happens when repairing an object becomes a shared activity?',
    paragraphs: [
      { id: 'A', text: 'At a community repair session, a broken object can start a conversation between people who would otherwise never meet. Someone with a torn coat may sit beside a volunteer who knows how to sew. As they work, stories are exchanged. Although the repaired coat is the visible outcome, organisers often value the new connections just as much.' },
      { id: 'B', text: 'These sessions are usually organised around working together. The owner stays at the table, watches the diagnosis and may carry out part of the repair. Volunteers explain why a particular step is needed rather than simply taking the object away. This approach allows the owner to leave with knowledge that could be useful when a similar problem happens again.' },
      { id: 'C', text: 'Enthusiasm and skill cannot overcome every obstacle. A device sealed with glue may be damaged just by opening it, and a small replacement part may be unavailable. In other cases, the information needed to identify a fault is missing. Repairers therefore encounter limits that were built into the product long before it arrived on their table.' },
      { id: 'D', text: 'A successful repair does not always make an object look new. Some participants choose thread that contrasts with the original fabric, turning a patch into a feature. The result tells a story about continued use rather than hiding it. Here, the aim is not to restore a flawless appearance, but to find value in an object’s visible history.' },
      { id: 'E', text: 'Running a popular session once is different from keeping it open every month. Tools need replacing, volunteers need time off, and someone must arrange a venue. Groups that depend on a single enthusiastic organiser can be fragile. Sharing responsibilities and setting a realistic schedule help turn an occasional event into a dependable community service.' },
    ],
    headings: [
      { id: 'i', text: 'Obstacles created by the product itself' },
      { id: 'ii', text: 'Making the activity sustainable over time' },
      { id: 'iii', text: 'Why buying new is always cheaper' },
      { id: 'iv', text: 'An opportunity to build social connections' },
      { id: 'v', text: 'Learning through participation' },
      { id: 'vi', text: 'Celebrating the signs of a repair' },
      { id: 'vii', text: 'Training every volunteer for paid employment' },
    ],
    questions: [
      { id: 'q1', paragraphId: 'A', text: 'Choose the best heading for paragraph A.', correctHeadingId: 'iv', explanation: 'The focus is the relationships formed while repairing, rather than a method of fixing coats.' },
      { id: 'q2', paragraphId: 'B', text: 'Choose the best heading for paragraph B.', correctHeadingId: 'v', explanation: 'Owners stay involved and receive explanations, so the activity passes on knowledge.' },
      { id: 'q3', paragraphId: 'C', text: 'Choose the best heading for paragraph C.', correctHeadingId: 'i', explanation: 'Glue, unavailable parts and missing information are product-related barriers to repair.' },
      { id: 'q4', paragraphId: 'D', text: 'Choose the best heading for paragraph D.', correctHeadingId: 'vi', explanation: 'Contrasting thread and visible patches show that evidence of repair can be valued rather than concealed.' },
      { id: 'q5', paragraphId: 'E', text: 'Choose the best heading for paragraph E.', correctHeadingId: 'ii', explanation: 'The paragraph concerns the organisation and shared responsibility needed to keep sessions running.' },
    ],
  },
  {
    id: 'round-3', revision: 1, label: 'Round 3', title: 'Learning the night sky',
    topic: 'SCIENCE & OBSERVATION', suggestedMinutes: 9,
    description: 'Why becoming a careful observer takes more than a powerful telescope.',
    paragraphs: [
      { id: 'A', text: 'A beginner may imagine that astronomy starts with an expensive telescope. In practice, learning to recognise a few bright stars with the naked eye provides a useful foundation. Returning to the same location on clear evenings makes changes easier to notice. Equipment can come later, once the observer has a sense of what to look for and where to look.' },
      { id: 'B', text: 'The first view after stepping outdoors is not necessarily the best one. Eyes need time to become accustomed to darkness, and looking at a bright phone screen interrupts that adjustment. Observers often prepare their notes in advance and keep bright lights away. Remaining in the dark for a while can reveal details that were invisible at the beginning.' },
      { id: 'C', text: 'Even a patient observer cannot see equally well from every location. Light from nearby buildings and streets makes faint objects harder to distinguish. A site away from direct glare may offer an improvement without requiring different equipment. When choosing where to observe, the darkness and openness of the surroundings can matter as much as the instrument being used.' },
      { id: 'D', text: 'Memory is a poor substitute for a careful record. An observer who notes the date, conditions and appearance of an object can make a more reliable comparison on the next visit. A rough sketch may preserve a detail that would otherwise be forgotten. Over time, this small collection of observations becomes evidence of change, rather than a series of uncertain impressions.' },
      { id: 'E', text: 'An unfamiliar point of light can be exciting, but excitement is not enough to establish a discovery. The observer first checks known objects, repeats the observation and compares notes with others. A surprising result may come from an ordinary source or a mistake. Careful verification protects the useful observation from an explanation reached too quickly.' },
    ],
    headings: [
      { id: 'i', text: 'Allowing the eyes to adapt' },
      { id: 'ii', text: 'Checking an unusual observation before drawing conclusions' },
      { id: 'iii', text: 'Keeping a record for future comparisons' },
      { id: 'iv', text: 'Starting with simple, regular observation' },
      { id: 'v', text: 'Choosing surroundings that improve visibility' },
      { id: 'vi', text: 'Using brighter screens to reveal faint stars' },
      { id: 'vii', text: 'Why the largest telescope is essential for beginners' },
    ],
    questions: [
      { id: 'q1', paragraphId: 'A', text: 'Choose the best heading for paragraph A.', correctHeadingId: 'iv', explanation: 'The main recommendation is to build a foundation through regular, unaided observation before buying equipment.' },
      { id: 'q2', paragraphId: 'B', text: 'Choose the best heading for paragraph B.', correctHeadingId: 'i', explanation: 'The details about waiting and avoiding phone screens all support the need to adapt to darkness.' },
      { id: 'q3', paragraphId: 'C', text: 'Choose the best heading for paragraph C.', correctHeadingId: 'v', explanation: 'This paragraph explains how the observing site and surrounding light affect visibility.' },
      { id: 'q4', paragraphId: 'D', text: 'Choose the best heading for paragraph D.', correctHeadingId: 'iii', explanation: 'Notes and sketches provide a dependable basis for comparing observations over time.' },
      { id: 'q5', paragraphId: 'E', text: 'Choose the best heading for paragraph E.', correctHeadingId: 'ii', explanation: 'The paragraph focuses on checking evidence before interpreting an unfamiliar object as a discovery.' },
    ],
  },
];

export function getMarkableContent(round) {
  return Object.fromEntries([
    ...round.paragraphs.map(p => [`passage:${p.id}`, p.text]),
    ...round.headings.map(h => [`heading:${h.id}`, h.text]),
    ...round.questions.map(q => [`question:${q.id}`, q.text]),
  ]);
}

export function validateRounds(items) {
  const unique = values => new Set(values).size === values.length;
  if (!items.length || !unique(items.map(r => r.id))) throw new Error('Round IDs must be unique.');
  for (const round of items) {
    if (!round.id || !Number.isInteger(round.revision) || !round.paragraphs.length || !round.questions.length ||
        !unique(round.paragraphs.map(p => p.id)) || !unique(round.headings.map(h => h.id)) ||
        !unique(round.questions.map(q => q.id))) throw new Error(`Invalid round structure: ${round.id}`);
    for (const question of round.questions) {
      if (!round.paragraphs.some(p => p.id === question.paragraphId) ||
          !round.headings.some(h => h.id === question.correctHeadingId)) throw new Error(`Invalid question: ${question.id}`);
    }
  }
}
