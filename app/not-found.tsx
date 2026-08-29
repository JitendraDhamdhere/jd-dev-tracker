import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary p-4 text-center">
      <h1 className="text-6xl font-heading font-extrabold text-brand-primary mb-2">404</h1>
      <h2 className="text-xl font-heading font-bold mb-4">Page Not Found</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-glow transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
