---
name: Ethereal Intelligence
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#4e4540'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#7f756f'
  outline-variant: '#d1c4bd'
  surface-tint: '#685c55'
  primary: '#170f0a'
  on-primary: '#ffffff'
  primary-container: '#2d241e'
  on-primary-container: '#988a82'
  inverse-primary: '#d3c3ba'
  secondary: '#685d4b'
  on-secondary: '#ffffff'
  secondary-container: '#eeddc7'
  on-secondary-container: '#6d614f'
  tertiary: '#0c1214'
  on-tertiary: '#ffffff'
  tertiary-container: '#212729'
  on-tertiary-container: '#888e90'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dfd6'
  primary-fixed-dim: '#d3c3ba'
  on-primary-fixed: '#221a14'
  on-primary-fixed-variant: '#4f453e'
  secondary-fixed: '#f1e0ca'
  secondary-fixed-dim: '#d4c4af'
  on-secondary-fixed: '#221a0d'
  on-secondary-fixed-variant: '#504535'
  tertiary-fixed: '#dee3e6'
  tertiary-fixed-dim: '#c2c7ca'
  on-tertiary-fixed: '#171d1e'
  on-tertiary-fixed-variant: '#42484a'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
  ink: '#2D241E'
  parchment: '#F7F4EF'
  sandstone: '#C4B5A0'
  muted-gold: '#A6957D'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '500'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The brand personality is sophisticated, intellectual, and quietly powerful. It targets professionals seeking a refined, high-end AI experience that feels more like a boutique editorial service than a cold utility. The aesthetic balances the cutting-edge nature of artificial intelligence with the timeless warmth of classical publishing.

The design style is a blend of **Minimalism** and **Modern Corporate**, utilizing expansive whitespace and high-quality serif typography to create a sense of calm and competence. It avoids the neon-heavy "tech" tropes, opting instead for a "Paper & Silicon" narrative where digital intelligence is presented through a tactile, organic lens.

## Colors
The palette is built on a high-contrast foundation of "Ink" and "Parchment." The primary color, a deep charcoal-brown, provides the weight and authority needed for typography and primary actions. The neutral background color is a warm, off-white parchment that reduces eye strain and provides a premium, non-industrial feel.

Secondary accents use a desaturated sandstone to bridge the gap between the dark ink and light background, perfect for borders, secondary buttons, and decorative elements. This palette evokes the feeling of high-quality stationery and archival materials.

## Typography
The typography system uses a classic Serif/Sans-Serif pairing. **EB Garamond** (serving as a superior alternative to Cormorant Garamond for the web) is used for headlines and display text to establish a literary, sophisticated tone. Its elegant curves and varied stroke widths provide the "sophisticated" element of the design.

**Inter** is utilized for body copy and UI labels to ensure maximum legibility and a modern, technical functionalism. Headlines should use tight tracking and generous line heights to maintain an editorial feel, while labels should be slightly tracked out and set in semi-bold for clarity.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain the centered, editorial aesthetic of a well-designed publication. The system uses a 12-column grid with generous 24px gutters.

Spacing is aggressive in its use of whitespace; sections should be separated by large vertical gaps (80px to 120px) to allow the content to breathe. On mobile, the grid collapses to a single column with 20px side margins, emphasizing a clean, vertical flow. All padding and margins follow a strict 8px linear scale to ensure rhythmic consistency.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than heavy shadows. The base of the application is the parchment color (#F7F4EF). To indicate elevation or containment, use subtle sandstone outlines or slightly darker tonal shifts in the background.

When shadows are necessary (such as for floating modals), they must be **Ambient Shadows**: extremely soft, using the "Ink" color at very low opacity (3-5%) with a large blur radius (30px+). This keeps the design feeling flat and printed, rather than overly digital or "skeuomorphic." Use hairline borders (0.5px or 1px) in #C4B5A0 to define container edges with precision.

## Shapes
The shape language is disciplined and "Soft." By using 0.25rem (4px) as the base radius, the UI avoids the playfulness of fully rounded corners while escaping the harshness of sharp, 90-degree angles. This subtle rounding mimics the slightly softened corners of premium cardstock or a bound book. Interactive elements like buttons and input fields should strictly adhere to this radius to maintain a structural, architectural feel.

## Components
- **Buttons:** Primary buttons use the deep "Ink" (#2D241E) background with white text. Secondary buttons use a transparent background with a 1px sandstone border.
- **Input Fields:** Use a subtle sandstone bottom-border only for a "form" feel, or a full 1px border with a slightly lighter parchment background to indicate focus.
- **Cards:** Cards should have no shadow; instead, use a 1px border in #C4B5A0. Headlines inside cards should always be EB Garamond.
- **Chips/Badges:** Small, uppercase Inter labels with increased letter spacing, housed in a sandstone-tinted pill shape with 10% opacity.
- **AI Indicators:** Subtle, low-opacity gradients using the sandstone color to highlight AI-generated content, avoiding flashy animations in favor of elegant fades.
- **Lists:** Use custom icons or simple horizontal rules to separate items, maintaining the clean, structured look of a resume or manuscript.