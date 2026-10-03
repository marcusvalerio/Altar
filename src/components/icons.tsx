// Ícones minimalistas desenhados para o ALTAR (traço 1.5, sem preenchimento).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 22, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Início: um horizonte com o sol nascendo — "hoje". */
export const IconToday = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17.5h18" />
    <path d="M7 17.5a5 5 0 0 1 10 0" />
    <path d="M12 6.5v2M5.6 10.1l1.3 1.3M18.4 10.1l-1.3 1.3" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    <circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconBookmark = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p}>
    <path d="M6.5 4.5h11v15.5L12 16l-5.5 4V4.5Z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);

export const IconMore = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 8h15M4.5 12h15M4.5 16h9" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 6l6 6-6 6" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 6l-6 6 6 6" />
  </Svg>
);

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4" />
    <path d="M6 11.5H5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 5 20.5h14a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5h-1" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v12M7.5 11l4.5 4.5 4.5-4.5M4.5 20.5h15" />
  </Svg>
);

export const IconTextSize = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 18l4.5-11 4.5 11M5.2 14h5.6" />
    <path d="M14 18l3.25-7.5L20.5 18M15.1 15.5h4.3" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
