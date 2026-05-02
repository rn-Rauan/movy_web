import { Skeleton } from "@/components/ui/skeleton";

interface LoadingListProps {
  count?: number;
  height?: string;
}

export function LoadingList({ count = 3, height = "h-24" }: LoadingListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-xl`} />
      ))}
    </div>
  );
}
