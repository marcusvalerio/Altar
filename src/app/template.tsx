// Transição entre telas: um leve surgimento, nada mais.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade">{children}</div>;
}
