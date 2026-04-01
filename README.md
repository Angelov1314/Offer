# Offer — Education Tycoon Game

A web-based simulation game where players adopt and raise children, guiding them from middle school through elite university admissions, graduate studies, and top-tier company offers.

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **State Management**: Zustand
- **Storage**: LocalStorage (via Zustand persist)
- **Styling**: Tailwind CSS
- **Data**: JSON data files (hot-reloadable)

## Project Structure

```
offer/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── adopt/             # Adoption center
│   └── child/[id]/        # Child detail page
├── lib/                    # Core game engine
│   ├── engine.ts          # Turn progression, event triggers, upgrade cost calculation
│   ├── gacha.ts           # Gacha system
│   ├── admissions.ts      # Application system (university/graduate)
│   ├── career.ts          # Job application system
│   └── economy.ts         # Economy system
├── store/                  # State management
│   └── gameStore.ts       # Zustand store
├── types/                  # TypeScript type definitions
│   └── index.ts
└── data/                   # JSON data files
    ├── mbti.json
    ├── races.json
    ├── nationalities.json
    ├── personality_tags.json
    ├── majors.json
    ├── universities.json
    └── companies.json
```

## Core Features

### Completed (Milestone 1 — Partial)

- ✅ Data model definitions (Child/Item/University/Company/Event)
- ✅ MBTI / nationality / race / personality data files (JSON)
- ✅ Adoption system + child detail page
- ✅ Core game engine (Engine, Gacha, Admissions, Career, Economy)
- ✅ State management (Zustand) + local storage
- ✅ Base page structure (Home, Adoption Center, Child Detail)

### To Do

- [ ] Turn progression system
- [ ] Basic items (10) + shop page
- [ ] Simplified university application: submit 5 → receive results
- [ ] Full application center page
- [ ] Career center page
- [ ] Gacha page
- [ ] Shop page

## Installation & Run

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Production mode
npm start
```

## Gameplay

1. **Adopt a Child**: Spend 1,000 coins at the Adoption Center
2. **Level Up Stats**: Upgrade your child's IQ, EQ, appearance, and more
3. **Apply to Universities**: Prepare applications and submit to schools
4. **Apply for Graduate Studies**: After undergraduate, apply for master's/PhD programs
5. **Job Hunt**: After graduation, apply to top companies

## Data-Driven

All game data is stored in `data/*.json` files and can be modified at any time without code changes.

## Disclaimer

- ⚠️ This game is for entertainment purposes only and does not reflect real admissions or hiring outcomes
- Race/nationality attributes are purely fictional game mechanics; players can customize labels
- No claims are made about real acceptance rates or hiring probabilities

## Development Roadmap

See `task.md` for the full milestone plan.
