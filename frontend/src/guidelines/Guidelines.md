# Leo Platform Design Guidelines

## Design System Consistency Requirements

### Cross-Platform Design Consistency
* All business cards must render identically across web and mobile platforms
* Use the Leo Design System color tokens (#F26522 primary orange) consistently
* Implement responsive design with consistent spacing, typography, and interactions
* Ensure 20px border radius (rounded-2xl) for all card containers
* Apply consistent shadow system: subtle (shadow-lg), strong (shadow-2xl), or none

### Card Design Standards
* **Template System**: Use professional templates with Leo branding
* **Color Palettes**: Leo Orange (#F26522) as primary, with 6 curated color options
* **Typography**: Inter font family as default with 6 professional font pairings
* **Layouts**: Support center, left, asymmetric, and split view layouts
* **Responsive Sizing**: Mobile (320px), Tablet (768px), Desktop (1200px) breakpoints

### Quality Assurance Requirements
* Every card must be mobile-first and responsive
* Cross-platform consistency validation on all devices
* Leo brand consistency with proper logo placement
* Professional aesthetic with clean, minimal design
* Proper spacing using 4px base grid system

### User Experience Standards
* Real-time preview across all device types
* One-click sharing with QR code generation
* Export functionality (PNG, PDF, SVG formats)
* Auto-save functionality with visual save status
* Undo/redo design history management

### Component Architecture
* Use CardDesignSystem component for design controls
* Use ResponsiveCardRenderer for consistent rendering
* Implement device preview mode with accurate sizing
* Support template switching with design preservation
* Maintain design history for undo/redo functionality

### Brand Consistency
* All cards must include "Powered by Leo" branding for free accounts
* Use Leo emoji (🦁) in appropriate contexts
* Maintain Leo orange (#F26522) as the primary brand color
* Follow Leo's Apple-inspired, minimal aesthetic
* Ensure professional appearance suitable for business networking

### Performance Requirements
* Fast loading with optimized images and minimal re-renders
* Smooth transitions and animations at 60fps
* Lazy loading for non-critical design assets
* Efficient memory usage in design preview modes
* Quick export processing with progress indicators

### Accessibility Standards
* Minimum 4.5:1 color contrast ratios
* Proper ARIA labels for screen readers
* Keyboard navigation support
* Touch targets minimum 44px on mobile
* Support for reduced motion preferences

## Implementation Notes
* Use the enhanced BuildModule for all card editing
* Integrate CardDesignSystem for professional template selection
* Ensure ResponsiveCardRenderer handles all device preview modes
* Implement proper error handling for image loading failures
* Maintain consistent Leo branding across all card variations