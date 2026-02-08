import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ocean-surface/20 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xl font-bold tracking-wider text-white">SALVO</div>
          <p className="text-gray-500 text-sm mt-1">
            Built for lives that can&apos;t wait.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a
            href="#how-it-works"
            className="hover:text-ocean-cyan transition-colors"
          >
            How It Works
          </a>
          <a href="#tech" className="hover:text-ocean-cyan transition-colors">
            Tech Specs
          </a>
          <Link
            href="/dashboard"
            className="hover:text-ocean-cyan transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <div className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} SALVO. Hackathon Project.
        </div>
      </div>
    </footer>
  );
}
