"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import type { FormState } from "@/app/actions";
import { FieldError } from "@/components/field-error";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  title: string;
  description: string;
  trigger: React.ReactElement;
  successMessage?: string;
};

export function DeleteDialog({ action, title, description, trigger, successMessage }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const next = await action(prev, formData);
    if (next.success) {
      setOpen(false);
      if (successMessage) toast.success(successMessage);
    }
    return next;
  }, {});

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              aria-label="비밀번호"
              aria-invalid={!!state.error}
              autoFocus
            />
            <FieldError message={state.error} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">취소</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "삭제 중..." : "삭제"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
