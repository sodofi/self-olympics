# Self Olympics - Country Leaderboard App

## Overview
A bold, high-contrast mobile-responsive leaderboard application built with Celo's brand palette and design principles.

## Features

### 🎨 Design
- **Bold Celo Brand Colors**:
  - Primary: Bright Yellow (#FCFF52)
  - Secondary: Deep Forest Green (#4E632A)
  - Background: Dark Purple (#1A0329)
  - Neutrals: Light Tan (#FBF6F1, #E6E3D5), Brown (#635949)
  
- **Typography**:
  - Headlines: Playfair Display (thin, architectural, with italics for emphasis)
  - Body: Inter (clean, geometric, bold when needed)
  
- **UI Elements**:
  - Sharp rectangular components with 4px black borders
  - High-contrast color blocks
  - Bold color inversions on hover (yellow ↔ black)
  - No rounded corners, no soft pastels, no subtle gradients

### ✨ Functionality

1. **Country Leaderboard**
   - Displays countries ranked by registration count
   - Real-time updates when users register
   - Alternating row colors for readability
   - Highlights user's registered country in yellow

2. **Registration Flow**
   - "REGISTER YOUR NATIONALITY" button (bold yellow with black border)
   - Opens full-screen country selector modal
   - 20 countries available for selection
   - Button changes to "✓ REGISTERED" (forest green) after registration
   - Selected country gets +1 registration and re-ranks

3. **Mobile-First Design**
   - Fully responsive from mobile to desktop
   - Touch-friendly button sizes (48px+)
   - Bottom-sheet style modal on mobile
   - Optimized text sizes for all screen sizes

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Playfair Display & Inter fonts (Google Fonts)

## Running the App

```bash
cd apps/web
npm run dev
```

Visit http://localhost:3000 to see the leaderboard.

## Design Principles Applied

✅ Raw and structural layout with visible borders  
✅ Big color blocks and sharp edges  
✅ Typography as a core visual element  
✅ High-contrast palette with no soft pastels  
✅ Bold color inversions on interactive elements  
✅ Asymmetric spacing with vast negative space  
✅ Poster-like screens where color and type ARE the interface  
✅ Unpolished, striking, unapologetic tone  

## Future Enhancements
- Backend integration for persistent registration data
- User authentication via Farcaster/wallet
- Real-time WebSocket updates
- Country-specific analytics
- Social sharing features

