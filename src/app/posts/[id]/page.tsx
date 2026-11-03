import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EyeIcon, ListIcon, MessageSquareIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { createComment, deleteComment, deletePost } from "@/app/actions";
import { CommentForm } from "@/components/comment-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPost, getPostWithComments } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

// The title in generateMetadata comes from the live post data, so navigation here waits for it.
export const instant = false;

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: PageProps<"/posts/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const post = id ? await getPost(id) : null;
  return { title: post?.title ?? "게시글 없음" };
}

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const data = await getPostWithComments(id, { countView: true });
  if (!data) notFound();
  const { post, comments } = data;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-2xl leading-snug break-words">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.author}</span>
            <span>{formatDateTime(post.createdAt)}</span>
            {post.updatedAt !== post.createdAt && <span>(수정됨 {formatDateTime(post.updatedAt)})</span>}
            <span className="flex items-center gap-1">
              <EyeIcon className="size-3.5" />
              {post.views}
            </span>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="min-h-48 py-6">
          <div className="whitespace-pre-wrap break-words leading-7">{post.content}</div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <ListIcon data-icon="inline-start" />
            목록
          </Link>
          <div className="flex gap-2">
            <Link href={`/posts/${post.id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <PencilIcon data-icon="inline-start" />
              수정
            </Link>
            <DeleteDialog
              action={deletePost.bind(null, post.id)}
              title="게시글을 삭제할까요?"
              description="삭제한 글과 댓글은 복구할 수 없습니다. 작성 시 입력한 비밀번호를 입력해주세요."
              trigger={
                <Button variant="destructive">
                  <Trash2Icon data-icon="inline-start" />
                  삭제
                </Button>
              }
            />
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="size-4" />
            댓글 {comments.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {comments.length > 0 && (
            <ul className="flex flex-col divide-y">
              {comments.map((comment) => (
                <li key={comment.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{comment.content}</p>
                  </div>
                  <DeleteDialog
                    action={deleteComment.bind(null, comment.id)}
                    title="댓글을 삭제할까요?"
                    description="작성 시 입력한 비밀번호를 입력해주세요."
                    successMessage="댓글이 삭제되었습니다."
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="댓글 삭제">
                        <Trash2Icon />
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          <CommentForm action={createComment.bind(null, post.id)} />
        </CardContent>
      </Card>
    </div>
  );
}
