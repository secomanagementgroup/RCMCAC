# Project memory

## Product intent & audience

- Landing page for an individual car salesman (not a dealership) to capture leads
- Target audience: local car buyers and sellers interested in GM brands (Chevrolet, Buick, GMC, Cadillac)
- Dual conversion paths: "I want to buy" and "I want to sell my vehicle"
- Lead data feeds into an associated database for funnel filtering and follow-up qualification

## Brand personality & voice

- Personal, approachable, trustworthy — emphasizes a single point of contact rather than a corporate dealership
- Confident but not aggressive; positions the salesman as a knowledgeable GM specialist
- Likely calls-to-action: "Get a quote," "Find my car," "Sell your car," "Contact [Name]"

## Visual design & UX direction

- Mobile-first and mobile-friendly (primary device target)
- Hero section with clear value proposition and dual buy/sell entry points
- Lead capture form(s) with minimal friction: likely name, phone/email, vehicle interest or details
- Use Lucide React icons for any iconography; avoid external icon packages
- Tailwind CSS for styling; React hooks for state (form state, buy/sell toggle)
- Import project modules via `@/` path alias (`src/` mapping)
- Production-quality, distinctive design — avoid generic/cookie-cutter templates
- Anticipate sections: hero, about the salesman, buy/sell CTAs, GM brand showcase, lead form, testimonials/social proof, contact/footer

## Decisions, constraints & rationale

- Vite + React chosen for fast dev and lightweight SPA landing page
- Tailwind enables rapid responsive iteration without custom CSS files
- Dual buy/sell funnel from the start to segment leads early in the capture flow
- Database integration implied for storing and filtering leads by intent (buy vs sell), vehicle type, and GM brand
- Individual salesman context means personal branding elements (photo, bio, direct contact) should be prominent

## Open questions & assumptions

- Salesman's name, photo, contact details, and service area not yet provided
- Specific GM brand focus (all four vs subset) unconfirmed
- Database/backend stack for lead storage and filtering not specified
- Form submission destination (email, CRM, API endpoint) unknown
- Whether existing inventory or vehicle listings should be displayed, or if it's purely lead capture
- Logo/branding assets and color preferences not yet defined