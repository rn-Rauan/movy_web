import { Card } from "@/components/ui/card";

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  return <Card className="p-4 text-sm text-destructive">{message}</Card>;
}
