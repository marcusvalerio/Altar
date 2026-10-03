import type { Metadata } from "next";
import { CalendarView } from "./calendar-view";

export const metadata: Metadata = { title: "Calendário" };

export default function Page() {
  return <CalendarView />;
}
