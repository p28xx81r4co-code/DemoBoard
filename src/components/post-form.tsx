"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { FieldError } from "@/components/field-error";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  mode: "create" | "edit";
  cancelHref: string;
  defaultValues?: { title: string; content: string; author: string };
};

export function PostForm({ action, mode, cancelHref, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  const values = { ...defaultValues, ...state.values };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="author">작성자</Label>
          <Input
            id="author"
            name="author"
            maxLength={20}
            defaultValue={values.author}
            disabled={mode === "edit"}
            aria-invalid={!!errors.author}
            placeholder="닉네임"
          />
          <FieldError message={errors.author} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "create" ? "new-password" : "current-password"}
            aria-invalid={!!errors.password}
            placeholder={mode === "create" ? "수정·삭제 시 필요 (4자 이상)" : "작성 시 입력한 비밀번호"}
          />
          <FieldError message={errors.password} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          maxLength={100}
          defaultValue={values.title}
          aria-invalid={!!errors.title}
          placeholder="제목을 입력하세요"
        />
        <FieldError message={errors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={14}
          defaultValue={values.content}
          aria-invalid={!!errors.content}
          placeholder="내용을 입력하세요"
          className="min-h-72"
        />
        <FieldError message={errors.content} />
      </div>

      <FieldError message={state.error} />

      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          취소
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : mode === "create" ? "등록" : "수정"}
        </Button>
      </div>
    </form>
  );
}
