import Link from "next/link";

export function HeaderLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-neutral-600 transition-colors hover:text-brand-700"
    >
      {label}
    </Link>
  );
}
