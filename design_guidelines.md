# QSecureX Design Guidelines

## Design Approach

**Reference-Based Approach**: Security + Modern SaaS Hybrid

Drawing inspiration from:
- **Stripe**: Clean, professional dashboard interfaces with subtle gradients
- **Signal/ProtonMail**: Privacy-focused, trust-building visual language
- **Linear**: Modern typography, sharp layouts, minimal animations
- **Supabase**: Developer-friendly, approachable technical product design

**Core Principles**:
- **Trust Through Simplicity**: Clean, uncluttered layouts that convey professionalism
- **Security-First Visual Language**: Dark theme with electric accents (blues/cyans) suggesting encryption and protection
- **Information Clarity**: Clear hierarchy for technical specifications and pricing
- **Conversion-Optimized**: Strategic CTAs and social proof placement

---

## Typography System

**Primary Font**: Inter (Google Fonts) - Modern, technical, highly legible
**Accent Font**: Space Grotesk (Google Fonts) - For headings and numerical data

**Hierarchy**:
- **Hero Headings**: text-5xl/text-6xl font-bold tracking-tight
- **Section Headings**: text-3xl/text-4xl font-semibold
- **Subsection Titles**: text-xl/text-2xl font-medium
- **Body Text**: text-base/text-lg leading-relaxed
- **Small Print/Labels**: text-sm font-medium uppercase tracking-wide
- **Technical Specs**: Space Grotesk, text-lg font-mono for encryption standards (AES-256-GCM)

---

## Layout & Spacing System

**Tailwind Units**: Consistently use **4, 6, 8, 12, 16, 20, 24** for spacing primitives

**Container Strategy**:
- Marketing pages: `max-w-7xl mx-auto px-6`
- Dashboards: `max-w-screen-2xl mx-auto px-8`
- Content sections: `max-w-4xl mx-auto` for text-heavy areas

**Section Padding**:
- Desktop: `py-20` to `py-32`
- Mobile: `py-12` to `py-16`

**Multi-Column Usage**:
- Feature grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Dashboard cards: `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`
- Pricing: `grid-cols-1 md:grid-cols-3` (responsive stack)
- Admin tables: Full-width single column with horizontal scroll on mobile

---

## Component Library

### Marketing Website Components

**Hero Section** (Home):
- Full-width section with gradient overlay
- Badge component (rounded-full, small text, subtle glow effect)
- Large heading with gradient text treatment on "Under Your Control"
- Two-button CTA group (primary + secondary outline)
- Statistics bar: 4-column grid with icon + label + value
- Large hero image: Shield with encrypted lock visualization

**Feature Cards**:
- Card with icon (64x64), title, description
- Subtle border, hover lift effect
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile
- Icons from Heroicons (shield, lock, server, folder, zap, eye-off)

**Pricing Cards**:
- Elevated cards with distinct border for "Most Popular" plan
- Badge for discount/savings
- Large price display with strikethrough for original price
- Feature list with checkmark icons
- CTA button at bottom
- Add-ons section below main pricing tiers

**Comparison Table** (Why Go Offline):
- Two-column split: Traditional Cloud vs QSecureX Vault
- Red X icons vs Green checkmarks
- Side-by-side feature comparison

**Testimonial Cards**:
- Avatar placeholder (circular), name, role
- Quote text in quotation marks
- Star rating visual (5 stars)
- 3-column grid layout

**FAQ Accordion**:
- Expandable panels with chevron indicators
- Question in bold, answer revealed on click
- Single column, full-width

### Authentication Pages

**Login/Register Forms**:
- Centered card (max-w-md)
- Logo at top
- Form inputs with labels above
- Password visibility toggle icon
- "Remember me" checkbox
- Primary CTA button (full-width)
- Footer links: "Forgot password?" / "Create account"
- Divider with "or continue with" for future social auth

### User Dashboard

**Layout**:
- Top navigation bar: Logo left, user menu right
- Sidebar navigation (collapsible on mobile): Dashboard, My Licenses, Downloads, Account, Support
- Main content area with breadcrumbs
- Welcome card with user name and quick stats

**Dashboard Cards**:
- License status card: Plan name, expiry, device count
- Download section: Platform buttons (Android, Windows, Mac, Linux) with version info
- Recent activity timeline
- Quick actions: "Purchase License", "Download App", "Contact Support"

### Admin Dashboard

**Layout**:
- Admin sidebar: Dashboard, Users, Licenses, Sales, Contact Forms, Settings
- Top bar with search, notifications, admin profile

**Data Tables**:
- Sortable columns with header row
- Row actions menu (3-dot menu)
- Pagination at bottom
- Filters and search bar above table
- Export button (CSV/Excel)

**Analytics Cards**:
- Stat cards: Total Users, Active Licenses, Revenue (with trend indicators ↑↓)
- Charts: Line graph for sales over time (use Chart.js via CDN)
- Recent transactions list

**User Management Table**:
- Columns: Name, Email, Plan, Status, Joined Date, Actions
- Status badges (Active/Inactive)
- Bulk action toolbar for selected rows

---

## Images Strategy

**Hero Image** (Home page): 
Large, high-quality illustration of a 3D shield with digital lock/encryption visualization. Dark background with electric blue accents. Positioned right side on desktop, above content on mobile.

**Feature Section Images**:
- Messaging feature: Mock chat interface screenshot showing encrypted messages
- Security steps: Icon illustrations for each step

**About Page**:
Team or workspace photo showing professionalism (if available), otherwise abstract security-themed imagery

**Placement**: 
- Hero: 50/50 split (content left, image right) on desktop
- Feature sections: Alternating image left/right layout
- Testimonials: Small circular avatars (use placeholder initials if no photos)

---

## Animations & Interactions

**Minimal Animation Strategy**:
- Hover states: Subtle scale (scale-105) and shadow increase on cards
- Button hover: Slight glow/brightness increase
- Page transitions: None (instant navigation for snappy feel)
- Scroll animations: Fade-in on statistics counter only
- Dashboard: Loading skeletons for data fetch states

**No Animations**:
- Scroll-triggered effects
- Parallax
- Complex page transitions
- Auto-playing carousels

---

## Additional Specifications

**Icons**: Heroicons (outline for light backgrounds, solid for emphasis)

**Form Validation**: Inline error messages below inputs, red border on invalid fields

**Responsive Breakpoints**:
- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full multi-column layouts)

**Dashboard Responsiveness**: Sidebar collapses to hamburger menu on mobile, full-width cards stack vertically

**Accessibility**: Maintain WCAG AA contrast ratios, focus visible states on all interactive elements, semantic HTML structure with proper heading hierarchy