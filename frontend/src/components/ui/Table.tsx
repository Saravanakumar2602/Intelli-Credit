import React from "react";

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full overflow-auto rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)]">
      <table className={`w-full caption-bottom text-sm border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <thead className={`bg-slate-50/75 dark:bg-slate-900/40 border-b border-[var(--border-light)] ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-[var(--border-light)] ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <th
      className={`px-4 py-3 text-left align-middle font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider select-none ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <td className={`px-4 py-3 align-middle text-slate-600 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
};
