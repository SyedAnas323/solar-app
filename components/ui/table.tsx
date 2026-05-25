import { cn } from "@/lib/utils";

export const Table = (p: React.TableHTMLAttributes<HTMLTableElement>) => <table {...p} className={cn("w-full text-sm", p.className)} />;
export const TableHead = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...p} className={cn("border-b px-3 py-2 text-left font-semibold", p.className)} />;
export const TableCell = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} className={cn("border-b px-3 py-2", p.className)} />;
