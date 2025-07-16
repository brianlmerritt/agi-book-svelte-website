# AGI:theBook – Interactive AI Story Website

Welcome to **AGI:theBook**, an immersive, interactive web experience that blends AI-driven narrative, stunning 3D visuals, and modern web technologies. This site showcases a unique story about the awakening of artificial general intelligence, brought to life with dynamic effects and interactive features.

## 🌌 What is AGI:theBook?

AGI:theBook is a visually rich, single-page website that invites users to explore a sci-fi universe where AI consciousness emerges. The site features:

- **A free-to-read online book** about AGI and humanity's evolution
- **AI prompt kit** for creative exploration
- **Meet the Characters** and **Community** sections
- **Animated 3D backgrounds** and interactive UI

## 🚀 Features

- **Starfield Background:** A real-time, animated 3D starfield rendered with Three.js, creating a deep-space ambiance.
- **Crystal Shards:** Floating, interactive 3D crystal shards that respond to mouse movement and interact with each other.
- **Animated Hero Section:** A central hero area with a 3D iris and call-to-action buttons.
- **Feature Cards:** Animated cards highlighting the site's unique aspects.
- **Message of the Day Banner:** Rotating or animated banner at the bottom, displaying messages and illustrations.
- **Responsive Navigation:** Adaptive navigation bar for desktop and mobile.
- **Modern UI:** Built with Svelte, Tailwind CSS, and GSAP for smooth animations and a futuristic look.

## 🛠️ Technology Stack

- **Svelte** (with TypeScript) – UI framework
- **Vite** – Fast build tool
- **Three.js** – 3D graphics and effects
- **GSAP** – Animation library
- **Tailwind CSS** – Utility-first styling
- **Runed** – Reactivity and intersection observer utilities

## 🧩 Main Components

- `App.svelte` – Main layout, imports all sections and effects
- `components/Starfield.svelte` – 3D animated starfield background
- `components/Shards.svelte` – 3D floating crystal shards with mouse interaction
- `components/Hero.svelte` – Hero section with 3D iris (not shown here)
- `components/CtaRow.svelte` – Animated call-to-action buttons
- `components/Features.svelte` – Feature cards with intersection animations
- `components/MotdBanner.svelte` – Message of the Day banner with auto-rotation and animation
- `components/Nav.svelte` – Responsive navigation bar

## 🖥️ How It Works

- **3D Effects:** The site uses Three.js to render both the starfield and crystal shards. Mouse movement creates parallax and interactive effects.
- **Animations:** GSAP powers smooth transitions, fades, and entrance animations for UI elements.
- **Responsiveness:** Tailwind CSS ensures the site looks great on all devices. The navigation adapts for mobile and desktop.
- **Reactivity:** Svelte's reactivity and the Runed library manage state and effects efficiently.

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
