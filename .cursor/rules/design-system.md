---
alwaysApply: true
---

# Design Brief: White-Label AI Travel Platform

## Color Palette

### Primary Colors
- **Primary White** – `#FFFFFF`
  Used for backgrounds, cards, and clean surfaces.
- **Primary Midnight** – `#1F2937`
  Dark neutral for primary text, headers, and key emphasis.

### Secondary Colors
- **Secondary Teal** – `#2CB9B0`
  For primary buttons, highlights, and interactive elements.
- **Secondary Teal Light** – `#E6F7F6`
  For hovered/selected states and subtle backgrounds.

### Accent Colors
- **Accent Amber** – `#FFC845`
  Used sparingly for notifications, alerts, and call-attention elements.
- **Accent Purple** – `#8C5CF7`
  For secondary CTAs or to denote AI-generated suggestions.

### Functional Colors
- **Success Green** – `#38A169`
  For success messages and confirmations.
- **Error Red** – `#E53E3E`
  For errors, destructive actions, and critical alerts.
- **Warning Orange** – `#DD6B20`
  For cautionary states.
- **Neutral Gray** – `#9CA3AF`
  For disabled states and tertiary text.
- **Dark Gray** – `#4B5563`
  For secondary text and icons.

### Background Colors
- **Background Light** – `#F9FAFB`
  Subtle off-white for app backgrounds and panels.
- **Background Surface** – `#FFFFFF`
  Pure white for cards and primary content areas.
- **Background Overlay** – `rgba(31,41,55,0.6)`
  For modals, dialogs, and overlays.

## Typography

### Font Family
- **Primary Font**: Inter (Web / Desktop)
- **Fallback Font**: System UI (–apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Text Styles
| Style   | Size / LineHeight | Weight         | LetterSpacing | Use                                     |
|---------|-------------------|----------------|---------------|-----------------------------------------|
| H1      | 32px / 40px       | Bold (700)     | –0.5px        | Screen titles, page headers             |
| H2      | 24px / 32px       | Semibold (600) | –0.25px       | Section headings, modal titles          |
| H3      | 20px / 28px       | Semibold (600) | 0px           | Subsection titles, card titles          |
| Body L  | 18px / 28px       | Regular (400)  | 0px           | Primary reading text, walkthrough content |
| Body M  | 16px / 24px       | Regular (400)  | 0px           | Standard UI text, form labels           |
| Body S  | 14px / 20px       | Regular (400)  | 0.1px         | Secondary text, helper copy             |
| Caption | 12px / 16px       | Medium (500)   | 0.2px         | Timestamps, metadata, micro-labels      |
| Button  | 16px / 24px       | Medium (500)   | 0.1px         | All button labels                       |
| Link    | 16px / 24px       | Medium (500)   | 0px           | Inline links (color Secondary Teal)     |

## Component Styling

### Buttons
**Primary Button**
- Background: Secondary Teal (`#2CB9B0`)
- Text: White (`#FFFFFF`)
- Height: 48px
- Corner Radius: 8px
- Padding: 0 20px
- Hover: Background lightens to `#3BD1C9`
- Disabled: Background `#A7D9D6`, Text `#FFFFFF`

**Secondary Button**
- Border: 2px solid Secondary Teal (`#2CB9B0`)
- Background: Transparent
- Text: Secondary Teal (`#2CB9B0`)
- Height: 48px
- Corner Radius: 8px
- Padding: 0 20px
- Hover: Background `#E6F7F6`

**Text Button**
- Background: Transparent
- Text: Primary Midnight (`#1F2937`)
- Height: 40px
- Padding: 0 12px
- Hover: Text underlines or accent color highlight

### Cards
- Background: Background Surface (`#FFFFFF`)
- Shadow: `0px 2px 8px rgba(31,29,41,0.05)`
- Corner Radius: 12px
- Padding: 24px internal
- Border (optional): `1px solid #E5E7EB` for grouped card lists

### Input Fields
- Height: 48px
- Corner Radius: 8px
- Border: `1px solid #9CA3AF` (Neutral Gray)
- Focus Border: `2px solid #2CB9B0` (Secondary Teal)
- Background: Background Surface (`#FFFFFF`)
- Text: Primary Midnight (`#1F2937`)
- Placeholder Text: Neutral Gray (`#9CA3AF`)

### Icons
- Standard Icon: 24×24px
- Small Icon: 20×20px
- Navigation Icon: 28×28px
- Active Color: Secondary Teal (`#2CB9B0`)
- Inactive Color: Neutral Gray (`#9CA3AF`)

## Spacing System
| Token | Value | Use                                  |
|-------|-------|--------------------------------------|
| xs    | 4px   | Micro-spacing between related items  |
| sm    | 8px   | Small gaps, internal padding         |
| md    | 16px  | Default margins, grid gutters        |
| lg    | 24px  | Section separation                   |
| xl    | 32px  | Large layout breaks                  |
| xxl   | 48px  | Screen-level padding/top/bottom      |

## Motion & Animation
**Standard Transition**
- Duration: 200ms
- Curve: ease-out (`cubic-bezier(0.0, 0.0, 0.2, 1)`)

**Emphasis Transition**
- Duration: 300ms
- Curve: Spring (tension 300, friction 30)

**Microinteractions**
- Duration: 150ms
- Curve: ease-in-out

**Page Transitions**
- Duration: 350ms
- Curve: `cubic-bezier(0.2, 0.8, 0.2, 1)`

**Motion Guidelines**
- Use subtle fade-and-slide for modal dialogs.
- Apply spring-based easing for expandable panels.
- Respect reduced-motion preferences: fallback to fades only.

## Accessibility
**Contrast Ratios**
- Text on Primary White: ≥ 7:1 for Primary Midnight.
- Interactive elements: ≥ 4.5:1 against background.

**Touch Targets**
- Minimum 44×44px for all tap targets.

**Focus States**
- 3px outline of Secondary Teal on focusable elements.

**ARIA & Semantics**
- Ensure all icons have accessible labels.
- Use live regions for dynamic notifications.

This style guide ensures bold simplicity, breathable layouts, and purposeful accents, delivering an intuitive, accessible, and delightful experience for travel-industry pros leveraging your AI-powered platform.
description:
globs:
alwaysApply: false
---
