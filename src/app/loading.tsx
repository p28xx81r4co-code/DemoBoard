import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
