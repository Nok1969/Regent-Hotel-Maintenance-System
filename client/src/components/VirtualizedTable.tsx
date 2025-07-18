import React, { memo, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VirtualizedTableProps {
  items: any[];
  height?: number;
  itemHeight?: number;
  renderRow: (props: { index: number; style: React.CSSProperties; data: any[] }) => React.ReactNode;
  headers?: React.ReactNode;
  className?: string;
}

const VirtualizedTable = memo(({
  items,
  height = 400,
  itemHeight = 60,
  renderRow,
  headers,
  className = "",
}: VirtualizedTableProps) => {
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div className={`border rounded-lg ${className}`}>
      <Table>
        {headers && (
          <TableHeader>
            {headers}
          </TableHeader>
        )}
      </Table>
      
      <div style={{ height }}>
        <List
          height={height}
          itemCount={memoizedItems.length}
          itemSize={itemHeight}
          itemData={memoizedItems}
        >
          {renderRow}
        </List>
      </div>
    </div>
  );
});

VirtualizedTable.displayName = "VirtualizedTable";

export { VirtualizedTable };