"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteCommentById,
  deletePostById,
  insertComment,
  insertPost,
  updatePostById,
} from "@/lib/db";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<"title" | "content" | "author" | "password", string>>;
  success?: boolean;
  // Echoed back so inputs keep what the user typed after React resets the form.
  values?: Partial<Record<"title" | "content" | "author", string>>;
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function echo(values: { password: string } & FormState["values"]): FormState["values"] {
  return { title: values.title, content: values.content, author: values.author };
}

function validate(
  values: Partial<Record<"title" | "content" | "author" | "password", string>>,
): FormState["fieldErrors"] | undefined {
  const errors: NonNullable<FormState["fieldErrors"]> = {};
  if (values.title !== undefined) {
    if (!values.title) errors.title = "제목을 입력해주세요.";
    else if (values.title.length > 100) errors.title = "제목은 100자 이하로 입력해주세요.";
  }
  if (values.content !== undefined) {
    if (!values.content) errors.content = "내용을 입력해주세요.";
    else if (values.content.length > 10000) errors.content = "내용은 10,000자 이하로 입력해주세요.";
  }
  if (values.author !== undefined) {
    if (!values.author) errors.author = "작성자를 입력해주세요.";
    else if (values.author.length > 20) errors.author = "작성자는 20자 이하로 입력해주세요.";
  }
  if (values.password !== undefined && values.password.length < 4) {
    errors.password = "비밀번호는 4자 이상 입력해주세요.";
  }
  return Object.keys(errors).length ? errors : undefined;
}

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    title: field(formData, "title"),
    content: field(formData, "content"),
    author: field(formData, "author"),
    password: field(formData, "password"),
  };
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values: echo(values) };

  const post = await insertPost(values);
  revalidatePath("/");
  redirect(`/posts/${post.id}`);
}

export async function updatePost(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    title: field(formData, "title"),
    content: field(formData, "content"),
    password: field(formData, "password"),
  };
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values: echo(values) };

  const result = await updatePostById(id, values.password, values);
  if (result === "not_found") return { error: "게시글을 찾을 수 없습니다." };
  if (result === "wrong_password") return { fieldErrors: { password: "비밀번호가 일치하지 않습니다." }, values: echo(values) };

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

export async function deletePost(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const result = await deletePostById(id, field(formData, "password"));
  if (result === "not_found") return { error: "게시글을 찾을 수 없습니다." };
  if (result === "wrong_password") return { error: "비밀번호가 일치하지 않습니다." };

  revalidatePath("/");
  redirect("/");
}

export async function createComment(postId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    content: field(formData, "content"),
    author: field(formData, "author"),
    password: field(formData, "password"),
  };
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values: echo(values) };

  const comment = await insertComment({ postId, ...values });
  if (!comment) return { error: "게시글을 찾을 수 없습니다.", values: echo(values) };

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteComment(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const deleted = await deleteCommentById(id, field(formData, "password"));
  if (deleted.result === "not_found") return { error: "댓글을 찾을 수 없습니다." };
  if (deleted.result === "wrong_password") return { error: "비밀번호가 일치하지 않습니다." };

  revalidatePath(`/posts/${deleted.postId}`);
  revalidatePath("/");
  return { success: true };
}
