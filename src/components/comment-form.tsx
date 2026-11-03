"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import type { FormState } from "@/app/actions";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

export function CommentForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const next = await action(prev, formData);
    if (next.success) toast.success("댓글이 등록되었습니다.");
    return next;
  }, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Input
            name="author"
            maxLength={20}
            defaultValue={values.author}
            placeholder="작성자"
            aria-label="작성자"
            aria-invalid={!!errors.author}
          />
          <FieldError message={errors.author} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호 (4자 이상)"
            aria-label="비밀번호"
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password} />
        </div>
      </div>
      <Textarea
        name="content"
        rows={3}
        maxLength={1000}
        defaultValue={values.content}
        placeholder="댓글을 입력하세요"
        aria-label="댓글 내용"
        aria-invalid={!!errors.content}
      />
      <FieldError message={errors.content ?? state.error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
