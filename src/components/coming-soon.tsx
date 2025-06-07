import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "lucide-react";

export function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>Coming Soon!</AlertTitle>
        <AlertDescription>
          This feature is currently under development. Please check back later!
        </AlertDescription>
      </Alert>
    </div>
  );
}
