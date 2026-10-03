import { ViewTransition } from "react";

// Transição entre telas: a tela anterior se dissolve rápido; a nova assenta.
// Elementos com nome compartilhado (card → leitura) mudam de lugar em vez disso.
export default function Template({ children }: { children: React.ReactNode }) {
  return <ViewTransition default="page">{children}</ViewTransition>;
}
