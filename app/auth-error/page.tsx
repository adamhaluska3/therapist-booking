import Link from "next/link";

const messages = {
  unauthorized: {
    title: "Vyžaduje sa prihlásenie",
    description: "Pre prístup na túto stránku sa musíte prihlásiť.",
    action: { label: "Domov", href: "/" },
  },
  forbidden: {
    title: "Prístup zamietnutý",
    description: "Nemáte oprávnenie na prístup k tejto stránke.",
    action: { label: "Domov", href: "/" },
  },
} as const;

const fallback = {
  title: "Niečo sa pokazilo",
  description: "Vyskytla sa neočakávaná chyba.",
  action: { label: "Domov", href: "/" },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const { title, description, action } =
    messages[reason as keyof typeof messages] ?? fallback;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-10 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-brand-800 mb-3">{title}</h1>
        <p className="text-brand-600 mb-8">{description}</p>
        <Link
          href={action.href}
          className="inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          {action.label}
        </Link>
      </div>
    </div>
  );
}
