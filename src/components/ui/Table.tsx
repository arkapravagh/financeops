import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

type Align = { align?: "left" | "right" | "center" };
const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

export function Th({ align = "left", className = "", children, ...rest }: ThHTMLAttributes<HTMLTableCellElement> & Align) {
  return (
    <th
      scope="col"
      className={`border-b border-line px-5 py-2.5 text-xs font-medium whitespace-nowrap text-muted ${alignClass[align]} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ align = "left", className = "", children, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & Align) {
  return (
    <td
      className={`border-b border-line px-5 py-3 text-ink ${alignClass[align]} ${align === "right" ? "tabular-nums" : ""} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}
