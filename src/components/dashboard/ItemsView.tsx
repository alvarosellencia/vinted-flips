"use client";

type ItemRow = Record<string, any>;

export default function ItemsView({
  items,
}: {
  items: ItemRow[];
}) {
  return (
    <section className="mt-6">
      <div className="vf-card">
        <div className="vf-card-inner flex items-center justify-between">
          <div className="text-lg font-semibold">Prendas</div>
          <div className="text-sm opacity-70">{items.length}</div>
        </div>
      </div>

      <div className="mt-4 vf-card">
        <div className="vf-card-inner">
          {items.length === 0 ? (
            <div className="text-sm opacity-70">Aún no tienes prendas.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={it.id ?? idx} className="vf-panel p-4">
                  <div className="font-semibold">
                    {it.title ?? it.name ?? it.brand ?? `Prenda ${idx + 1}`}
                  </div>
                  <div className="text-sm opacity-70 mt-1">
                    {it.status ? `Estado: ${it.status}` : ""}
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