# AGI:theBook – Interactive AI Story Website

Welcome to **AGI:theBook**, an immersive, interactive web experience that blends AI-driven narrative, stunning 3D visuals, and modern web technologies. This site showcases a unique story about the awakening of artificial general intelligence, brought to life with dynamic effects and interactive features.

## 🌌 What is AGI:theBook?

AGI:theBook is a visually rich, single-page website that invites users to explore a sci-fi universe where AI consciousness emerges. The site features:

- **A free Chapter 1 draft** to read online (ChatGPT o3 version)
- **AI prompt kit** available for purchase with the complete book
- **Meet the Characters** sections for both humans and AIs
- **Interactive 3D crystal game** with scoring and physics
- **Animated 3D backgrounds** and immersive UI

## 🚀 Features

- **Starfield Background:** A real-time, animated 3D starfield rendered with Three.js, creating a deep-space ambiance.
- **Interactive Crystal Game:** 3D floating crystal shards that respond to mouse movement and can be clicked for points. Features physics simulation with bouncing and collision detection.
- **Game Scoring System:** Real-time score tracking with reset functionality.
- **Animated Hero Section:** A central hero area with a 3D iris and call-to-action buttons.
- **Corner Feature Cards:** Four specialized feature components:
  - **Read Chapter 1:** Access the free Chapter 1 draft
  - **Meet the Humans:** Explore human character profiles
  - **Meet the AIs:** Discover AI character personalities
  - **AI Prompt Kit:** Purchase the complete book and creation prompts
- **Modal System:** Interactive modals for feature exploration.
- **Message of the Day Banner:** Rotating or animated banner at the bottom, displaying messages and illustrations.
- **Responsive Navigation:** Adaptive navigation bar for desktop and mobile.
- **Modern UI:** Built with Svelte 5 Runes, Tailwind CSS, and GSAP for smooth animations and a futuristic look.

## 🛠️ Technology Stack

- **Svelte 5** (with TypeScript and Runes) – UI framework with modern reactivity
- **Vite** – Fast build tool
- **Three.js** – 3D graphics, game physics, and effects
- **GSAP** – Animation library
- **Tailwind CSS** – Utility-first styling
- **Runed** – Reactivity and intersection observer utilities

## 🧩 Main Components

- `App.svelte` – Main layout, imports all sections and effects
- `components/Starfield.svelte` – 3D animated starfield background
- `components/Shards.svelte` – Interactive 3D crystal game with scoring and physics
- `components/Hero.svelte` – Hero section with 3D iris
- `components/CtaRow.svelte` – Animated call-to-action buttons
- `components/Features.svelte` – Main features container with intersection animations
- `components/TopLeftFeature.svelte` – Chapter 1 reading feature
- `components/TopRightFeature.svelte` – Human characters feature
- `components/BottomLeftFeature.svelte` – AI characters feature
- `components/BottomRightFeature.svelte` – AI Prompt Kit purchase feature
- `components/MotdBanner.svelte` – Message of the Day banner with auto-rotation and animation
- `components/Nav.svelte` – Responsive navigation bar

## 🎮 Interactive Game Features

- **Crystal Clicking:** Click on floating crystals to earn points
- **Physics Simulation:** Crystals bounce off invisible boundaries with realistic physics
- **Mouse Interaction:** Crystals respond to mouse movement with smooth interpolation
- **Score Tracking:** Real-time score display with persistent state management
- **Game Controls:** Reset score functionality

## 🖥️ How It Works

- **3D Effects:** The site uses Three.js to render both the starfield and interactive crystal game. Mouse movement creates parallax and interactive effects.
- **Game Mechanics:** Click detection on 3D objects, collision detection, and physics simulation for realistic crystal behavior.
- **Animations:** GSAP powers smooth transitions, fades, and entrance animations for UI elements.
- **State Management:** Svelte stores manage game state (scoring) and modal interactions.
- **Responsiveness:** Tailwind CSS ensures the site looks great on all devices. The navigation adapts for mobile and desktop.
- **Reactivity:** Svelte 5 Runes manage state and effects efficiently with modern reactive patterns.

## 📦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## 🤖 Contributing

Pull requests and suggestions are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

**AGI:theBook** – Where AI meets imagination.
