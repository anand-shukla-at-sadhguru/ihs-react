# React PWA Starter Template

A modern starter template for building installable Progressive Web Apps (PWAs) with React, Vite, TypeScript, Tailwind CSS, and Shadcn/ui.

## ✨ Features

*   ⚡️ **Vite:** Next-generation frontend tooling. Enjoy lightning-fast HMR and optimized builds.
*   🔒 **TypeScript:** Static typing for robust and maintainable code. (`strict` mode enabled).
*   🎨 **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   🧱 **Shadcn/ui:** Beautifully designed, accessible, and composable UI components built on Radix UI and Tailwind CSS.
*   📱 **Progressive Web App (PWA):** Configured out-of-the-box for offline support and installability using `vite-plugin-pwa`.
    *   Manifest generation
    *   Service Worker with Workbox (`generateSW`) for asset caching
*   Routing: Client-side routing with **React Router v6+**.
*   🌗 **Dark Mode:** Theme toggling using Tailwind's `class` strategy and CSS variables, integrated with Shadcn/ui.
*   🛠️ **Linting & Formatting:** Pre-configured ESLint and Prettier for code quality and consistency.
*   📁 **Sensible Directory Structure:** Organized for scalability.
*   📝 **Path Aliases:** `@/*` configured for cleaner imports (`tsconfig.json` + `vite-tsconfig-paths`).

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository (or use it as a template):**
    ```bash
    git clone https://github.com/your-username/my-pwa-starter.git your-project-name
    cd your-project-name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

## ⚙️ Available Scripts

*   **`npm run dev` or `yarn dev` or `pnpm dev`**: Starts the development server with HMR at `http://localhost:5173` (or the next available port). PWA features are enabled in dev mode for testing.
*   **`npm run build` or `yarn build` or `pnpm build`**: Builds the production-ready application, including TypeScript checks, optimized assets, and PWA manifest/service worker generation. Output is in the `dist/` folder.
*   **`npm run preview` or `yarn preview` or `pnpm preview`**: Serves the production build locally to preview its behavior, including the service worker.
*   **`npm run lint` or `yarn lint` or `pnpm lint`**: Lints the codebase using ESLint based on the configured rules.
*   **`npm run format` or `yarn format` or `pnpm format`**: Formats the codebase using Prettier.

##  PWA Features

This template uses `vite-plugin-pwa` to enable PWA capabilities.

*   **Manifest:** The web app manifest (`manifest.webmanifest` or similar, generated during build) allows the app to be installed on devices. Key details like name, icons, start URL, and display mode are configured in `vite.config.ts`.
*   **Service Worker:** A service worker (`sw.js`, generated during build using Workbox) runs in the background, enabling features like offline caching. The current configuration caches static assets (JS, CSS, images, fonts) using a `CacheFirst` strategy and provides examples for other strategies (like `NetworkFirst` for APIs).
*   **Testing Installability:**
    1.  Run `npm run build` and then `npm run preview`.
    2.  Open the preview URL in a PWA-supporting browser (like Chrome, Edge, Safari on iOS).
    3.  Look for an "Install" icon in the address bar or within the browser menu.
    4.  Use the browser's developer tools (Application tab -> Manifest / Service Workers) to inspect the configuration and lifecycle.

## Adding Shadcn/ui Components

This template is set up according to Shadcn/ui principles. To add new components:

1.  **Run the Shadcn/ui CLI:**
    ```bash
    npx shadcn-ui@latest add [component-name]
    # Example: npx shadcn-ui@latest add dialog alert-dialog tabs
    ```
2.  The CLI will use the `components.json` configuration to place the component code directly into `src/components/ui`.
3.  Import and use the component in your application as needed.

---

You should now have a complete, step-by-step guide to recreate the desired React Starter Template codebase and configuration. Remember to replace placeholder icons and potentially adjust PWA manifest details/caching strategies based on your specific application needs.