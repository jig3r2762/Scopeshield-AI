export interface Template {
  id: string
  category: string
  title: string
  content: string
}

export const messageTemplates: Template[] = [
  // Scope Definition Templates
  {
    id: 'scope-website',
    category: 'Scope Definition',
    title: 'Website Project Scope',
    content: `Project Scope:
- Design and development of [X] page website
- Responsive design for desktop, tablet, and mobile
- Contact form with email notifications
- Basic SEO setup (meta tags, sitemap)
- [X] rounds of revisions included
- Content provided by client`
  },
  {
    id: 'scope-app',
    category: 'Scope Definition',
    title: 'App/Software Project Scope',
    content: `Project Scope:
- Development of [feature list]
- User authentication system
- Admin dashboard
- API integration with [service]
- Testing and bug fixes
- [X] rounds of revisions included`
  },
  {
    id: 'scope-design',
    category: 'Scope Definition',
    title: 'Design Project Scope',
    content: `Project Scope:
- [X] design concepts/options
- [X] rounds of revisions per deliverable
- Final files in [formats]
- Source files included: [Yes/No]
- Print-ready files: [Yes/No]`
  },

  // Out of Scope Templates
  {
    id: 'oos-standard',
    category: 'Out of Scope',
    title: 'Standard Exclusions',
    content: `Out of Scope:
- Content writing and copywriting
- Photography or video production
- Ongoing maintenance after launch
- Third-party integrations not specified
- Additional pages beyond agreed count
- Rush delivery or expedited timelines`
  },
  {
    id: 'oos-technical',
    category: 'Out of Scope',
    title: 'Technical Exclusions',
    content: `Out of Scope:
- Server setup and hosting configuration
- Database migration
- Custom API development
- Analytics and tracking setup
- CRM integration
- Payment gateway integration
- Security audits`
  },

  // Boundary-Setting Replies
  {
    id: 'reply-boundary-polite',
    category: 'Reply Templates',
    title: 'Polite Boundary',
    content: `Thanks for thinking of this! This particular request falls outside our current project scope. I'd be happy to discuss adding it as a separate item if you'd like.`
  },
  {
    id: 'reply-boundary-firm',
    category: 'Reply Templates',
    title: 'Firm but Friendly',
    content: `I appreciate the idea! To keep us on track with the current timeline and budget, this would need to be handled as additional work. Want me to put together a quick estimate?`
  },

  // Add-on Replies
  {
    id: 'reply-addon-estimate',
    category: 'Reply Templates',
    title: 'Offer Estimate',
    content: `Great suggestion! This would be additional work outside our current agreement. I can prepare a quick estimate for this — would that be helpful?`
  },
  {
    id: 'reply-addon-future',
    category: 'Reply Templates',
    title: 'Future Phase',
    content: `Love this idea! It's a bit beyond what we scoped for this phase, but it could be a great addition for phase 2. Want me to note it down for future planning?`
  },

  // Negotiation Replies
  {
    id: 'reply-negotiate-swap',
    category: 'Reply Templates',
    title: 'Offer Trade-off',
    content: `Happy to explore this! To fit it in, we could swap it with [other feature] or extend the timeline slightly. What works better for you?`
  },
  {
    id: 'reply-negotiate-timeline',
    category: 'Reply Templates',
    title: 'Timeline Discussion',
    content: `This is doable! It would add about [X days/weeks] to our timeline. Would that work on your end, or should we look at other options?`
  },

  // Revision Limit Replies
  {
    id: 'reply-revision-limit',
    category: 'Reply Templates',
    title: 'Revision Limit Reached',
    content: `Thanks for the feedback! We've used our [X] included revision rounds. Additional revisions are available at [rate]. Want me to proceed, or would you like to prioritize the changes?`
  },
  {
    id: 'reply-revision-scope',
    category: 'Reply Templates',
    title: 'Revision vs New Work',
    content: `Just a heads up — this is more of a new direction than a revision of what we discussed. Happy to do it, but it would be additional work. Want me to share what that would look like?`
  }
]

export const templateCategories = [
  'Scope Definition',
  'Out of Scope',
  'Reply Templates'
]
