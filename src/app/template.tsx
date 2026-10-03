// Sem transição de tela inteira: trocar de tela precisa ser instantâneo no celular.
// O único movimento entre telas é o card da Início que se transforma na leitura
// (título, linha e superfície com nome compartilhado — ver cards.tsx e a página
// de leitura); cada tela faz a própria entrada, leve, só no que importa.
export default function Template({ children }: { children: React.ReactNode }) {
  return children;
}
