# Design Guide

## Overview
This design system is inspired by Root: A Game of Woodland Might and Right by Leder Games. The aesthetic captures the warmth, whimsy, and strategic depth of the woodland world without directly copying the game's assets.

## Design Principles
1. **Woodland Charm**: Warm, natural tones reminiscent of forest settings
2. **Clarity First**: Mobile-first, clean interfaces that prioritize usability
3. **Strategic Depth**: Visual hierarchy that guides users through complex data
4. **Playful Professionalism**: Friendly but functional

## Color Palette

### Primary Colors
These colors are inspired by the woodland factions:

- **Forest Green** (#22c55e): Primary actions, Woodland Alliance
- **Autumn Orange** (#f59e0b): Marquise de Cat, warm accents
- **Sky Blue** (#3b82f6): Eyrie Dynasty, secondary actions
- **Twilight Purple** (#8b5cf6): Vagabond, special states

### Neutral Colors
- **Bark Brown** (#78350f): Headers, dark text
- **Cream** (#fef3c7): Backgrounds, light surfaces
- **Stone Gray** (#d6d3d1): Borders, dividers
- **White** (#ffffff): Cards, content areas

### Semantic Colors
- **Success** (#22c55e): Wins, positive actions
- **Error** (#dc2626): Losses, destructive actions
- **Warning** (#f59e0b): Alerts, important info
- **Info** (#3b82f6): Tips, neutral information

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

Use system fonts for performance and native feel on all devices.

### Type Scale
- **Heading 1**: 2.5rem (40px) - Page titles
- **Heading 2**: 2rem (32px) - Section headers
- **Heading 3**: 1.5rem (24px) - Card titles
- **Heading 4**: 1.25rem (20px) - Subsections
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Secondary info
- **Tiny**: 0.75rem (12px) - Captions, labels

### Font Weights
- **Regular** (400): Body text
- **Medium** (500): Emphasized text
- **Semibold** (600): Subheadings
- **Bold** (700): Headings, buttons

## Spacing

Use consistent spacing based on 4px grid:

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Components

### Buttons
- **Primary**: Solid background, faction colors
- **Secondary**: Outlined, neutral
- **Ghost**: Text only, hover background
- Minimum touch target: 44x44px
- Border radius: 0.5rem (8px)
- Padding: 0.5rem 1rem (8px 16px)

### Cards
- Background: White or Cream
- Border: 1px solid Stone Gray
- Border radius: 0.75rem (12px)
- Shadow: Subtle, elevation-based
- Padding: 1rem (16px) to 1.5rem (24px)

### Forms
- Input height: 40px minimum
- Border: 1px solid Stone Gray
- Focus: 2px ring in primary color
- Border radius: 0.5rem (8px)
- Label: Small, Bark Brown, above input

### Icons
- Size: 16px, 20px, 24px
- Stroke width: 2px
- Color: Inherit from text or use faction colors
- Use lucide-react icon library

## Layout

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Approach
1. Design for mobile first (320px - 640px)
2. Enhance for tablet (640px - 1024px)
3. Optimize for desktop (1024px+)

### Navigation
- **Mobile**: Bottom tab bar (< 768px)
- **Desktop**: Left sidebar (≥ 768px)
- Always show current location
- Maximum 5 primary nav items

### Grid
- Mobile: Single column, full width
- Tablet: 2 columns
- Desktop: 3-4 columns
- Gap: 1rem (16px) to 1.5rem (24px)

## Imagery

### Faction Colors
Use faction colors (from factions.ts) for:
- Player avatars/badges
- Faction selectors
- Win/loss indicators
- Data visualization

### Icons vs Images
- Prefer icons for UI elements
- Use images only for game screenshots
- Optimize all images (WebP format)
- Provide alt text

## Accessibility

### Color Contrast
- **AA Standard**: 4.5:1 for normal text
- **AAA Standard**: 7:1 for small text
- Test all color combinations

### Focus States
- Visible focus ring on all interactive elements
- Minimum 2px thickness
- High contrast color

### Touch Targets
- Minimum 44x44px for all clickable elements
- Adequate spacing between touch targets
- Consider thumb zones on mobile

## Animation

### Principles
- Subtle and purposeful
- Enhance understanding, don't distract
- Respect prefers-reduced-motion

### Timing
- **Fast**: 150ms - Hover states, small changes
- **Medium**: 250ms - Transitions, reveals
- **Slow**: 350ms - Page transitions, complex animations

### Easing
- `ease-in-out`: Default for most transitions
- `ease-out`: Entrances
- `ease-in`: Exits

## Data Visualization

### Charts
- Use Recharts library
- Faction colors for different players
- Responsive sizing
- Clear labels and legends
- Tooltips on hover/touch

### Stats Cards
- Large numbers, small labels
- Positive changes in green
- Negative changes in red
- Icons to reinforce meaning

## Dark Mode
While not in initial MVP, design system includes dark mode tokens:
- Invert background/foreground
- Reduce contrast slightly
- Maintain faction colors with adjusted saturation
- Test readability

## Inspiration References
- Root board game aesthetic (woodland, warm, strategic)
- Modern mobile-first web apps
- Board game companion apps (Gloomhaven Helper, etc.)
- Data dashboards with personality

## Implementation Notes
- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Extend theme in tailwind.config.ts
- CSS variables for easy theming
