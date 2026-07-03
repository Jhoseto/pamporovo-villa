import type { LegalBlock, LegalSection } from "@shared/legal/bgContent";

function LegalParagraph({ text }: { text: string }) {
  return <p>{text}</p>;
}

function LegalHtml({ html }: { html: string }) {
  return (
    <p
      className="[&_a]:underline [&_a]:decoration-[var(--gold)] [&_a]:underline-offset-2 [&_a]:hover:text-[var(--gold)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ml-1 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LegalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[oklch(0_0_0/0.08)] text-left">
            {headers.map((h, i) => (
              <th
                key={i}
                className="py-2 pr-4 font-semibold text-[oklch(0.28_0.02_55)] last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[oklch(0_0_0/0.05)] text-[oklch(0.4_0.02_60)]">
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-2 pr-4 ${ci === 0 ? "font-mono text-xs" : ""} last:pr-0`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LegalSub({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-base font-semibold text-[oklch(0.28_0.02_55)]">{title}</h3>
      <div className="space-y-3">
        <LegalBlocks blocks={blocks} />
      </div>
    </div>
  );
}

export function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <LegalParagraph key={i} text={block.text} />;
          case "html":
            return <LegalHtml key={i} html={block.html} />;
          case "ul":
            return <LegalList key={i} items={block.items} />;
          case "sub":
            return <LegalSub key={i} title={block.title} blocks={block.blocks} />;
          case "table":
            return <LegalTable key={i} headers={block.headers} rows={block.rows} />;
          default:
            return null;
        }
      })}
    </>
  );
}

export function LegalDocumentView({ sections }: { sections: LegalSection[] }) {
  return (
    <article>
      {sections.map((section, i) => (
        <section key={i} className="mb-10">
          <h2 className="mb-4 font-serif text-2xl font-bold text-[oklch(0.22_0.02_55)] md:text-2xl">
            {section.title}
          </h2>
          <div className="space-y-4 text-[0.9375rem] leading-relaxed text-[oklch(0.38_0.02_55)]">
            <LegalBlocks blocks={section.blocks} />
          </div>
        </section>
      ))}
    </article>
  );
}
