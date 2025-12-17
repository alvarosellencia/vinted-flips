"use client";

type LotRow = Record<string, any>;

export default function LotsView({
  lots,
}: {
  lots: LotRow[];
}) {
  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between">
          <div className="text-lg font-semibold">Lotes</div>
          <div className="text-sm opacity-70">{lots.length}</div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {lots.length === 0 ? (
            <div className="text-sm opacity-70">No hay lotes aún.</div>
          ) : (
            <div className="space-y-3">
              {lots.map((l, idx) => (
                <div key={l.id ?? idx} className="vf-panel p-4">
                  <div className="font-semibold">{l.name ?? l.title ?? `Lote ${idx + 1}`}</div>
                  <div className="text-sm opacity-70 mt-1">
                    {l.created_at ? `Creado: ${String(l.created_at).slice(0, 10)}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}