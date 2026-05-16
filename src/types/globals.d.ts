// Allow importing CSS and common static assets in TypeScript
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.svg';

declare module '*.module.css';
declare module '*.module.scss';

interface ImportMeta {
  env: Record<string, string>;
}
