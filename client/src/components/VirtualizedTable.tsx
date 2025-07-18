import { memo, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps {
  data: any[];
  height: number;
  itemHeight: number;
  renderRow: (index: number, style: React.CSSProperties, data: any) => React.ReactNode;
  className?: string;
}

const VirtualizedTable = memo(({ 
  data, 
  height, 
  itemHeight, 
  renderRow, 
  className 
}: VirtualizedTableProps) => {
  const memoizedData = useMemo(() => data, [data]);

  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = memoizedData[index];
    return (
      <div style={style}>
        {renderRow(index, style, item)}
      </div>
    );
  });

  if (!memoizedData.length) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <List
        height={height}
        itemCount={memoizedData.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
});

VirtualizedTable.displayName = "VirtualizedTable";

export { VirtualizedTable };