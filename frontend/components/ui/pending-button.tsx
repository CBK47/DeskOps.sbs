"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type PendingButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel: string;
};

export function PendingButton({ children, pendingLabel, disabled, ...props }: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} aria-disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
