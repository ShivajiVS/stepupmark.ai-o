export function meta() {
  return [
    { title: "About · stepupmark" },
    { name: "description", content: "How this application is put together." },
  ];
}

export default function AboutRoute() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="text-pretty text-muted-foreground">
        This page and the home page are prerendered to static HTML at build time. They hold no
        per-request data, so there is nothing for a server to compute on each visit.
      </p>
      <p className="text-pretty text-muted-foreground">
        The authenticated area behind <code className="text-foreground">/app</code> renders on the
        client instead, because its data is private, personalised and changes while you are looking
        at it.
      </p>
    </div>
  );
}
