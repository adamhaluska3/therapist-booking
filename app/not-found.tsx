import Link from "next/link";

export const metadata = {
  title: "Stránka nenájdená",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-10 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-brand-800 mb-3">
          Stránka nenájdená
        </h1>
        <p className="text-brand-600 mb-8">
          Ľutujeme, ale stránka, ktorú hľadáte, neexistuje.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Späť na domovskú stránku
        </Link>
      </div>
    </div>
  );
}
