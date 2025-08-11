import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      <h1 className="text-4xl font-bold">Generative Engine Optimisation</h1>
      <p className="text-neutral-700">
        Analyse your site’s readiness for generative engines. Track recommendations as ToDo, Doing, and Done.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="bg-black text-white px-4 py-2 rounded">Get Started</Link>
        <Link href="/dashboard" className="border px-4 py-2 rounded">Go to Dashboard</Link>
      </div>
    </div>
  );
}
