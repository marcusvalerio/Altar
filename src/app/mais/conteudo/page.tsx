import type { Metadata } from "next";
import { Screen, ScreenHeader } from "@/components/ui";
import { contentMeta, devotionals } from "@/content/devotionals";
import { shortDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Sobre o conteúdo" };

export default function Page() {
  const specials = devotionals.filter((d) => d.commemorativeDate);
  return (
    <Screen>
      <ScreenHeader title="Sobre o conteúdo" back={{ href: "/mais/", label: "Mais" }} />

      <div className="space-y-12 text-[0.9375rem] leading-relaxed text-ink">
        <section>
          <h2 className="eyebrow mb-3">Origem</h2>
          <p>
            Todos os textos do ALTAR vêm do material editorial do projeto e são apresentados sem alterações.
            Nenhuma reflexão, prece, prática ou frase é escrita automaticamente pelo aplicativo.
          </p>
          <p className="mt-3 text-muted">
            {contentMeta.subtitle} · {devotionals.length} leituras.
          </p>
        </section>

        {contentMeta.editorialNotes.map((note, n) => (
          <section key={n}>
            {note.title && <h2 className="eyebrow mb-3">{note.title.toLowerCase()}</h2>}
            <div className="space-y-3 rounded-[20px] bg-surface-2/60 p-5 text-ink-2">
              {note.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="eyebrow mb-3">Fonte de inspiração</h2>
          <p>
            Ao final de cada leitura aparece a <em className="not-italic font-medium">fonte de inspiração</em>: a obra e o trecho
            temático que orientam a reflexão do dia. Ela não é uma citação literal — as frases do devocional não devem ser
            atribuídas aos autores das obras indicadas.
          </p>
        </section>

        {specials.length > 0 && (
          <section>
            <h2 className="eyebrow mb-3">Datas especiais deste período</h2>
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {specials.map((d) => (
                <li key={d.id} className="py-3">
                  <span className="text-muted">{shortDate(d.date)}</span> — {d.commemorativeDate!.label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              As composições gráficas destas datas são abstratas e provisórias, até a chegada de ilustrações autorais.
            </p>
          </section>
        )}
      </div>
    </Screen>
  );
}
