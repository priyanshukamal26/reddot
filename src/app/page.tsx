export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Phase-ring placeholder */}
        <div className="mx-auto w-32 h-32 rounded-full border-4 border-signal" />

        <h1 className="text-5xl font-bold tracking-tight">
          Red<span className="text-signal">Dot</span>
        </h1>

        <p className="text-fog text-lg max-w-md mx-auto">
          Menstrual health, private by design.
        </p>
      </div>
    </main>
  );
}
