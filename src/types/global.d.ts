// Lets TypeScript accept side-effect style imports of stylesheets,
// e.g. `import "@/styles/admin.css"` — Next.js handles the actual bundling.
declare module "*.css";
declare module "*.scss";
