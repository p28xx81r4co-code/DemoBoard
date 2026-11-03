import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updatePost } from "@/app/actions";
import { PostForm } from "@/components/post-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPost } from "@/lib/db";

export const metadata: Metadata = { title: "글 수정" };

export default async function EditPostPage({ params }: PageProps<"/posts/[id]/edit">) {
  const id = Number((await params).id);
  const post = Number.isInteger(id) && id > 0 ? await getPost(id) : null;
  if (!post) notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">글 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <PostForm
          action={updatePost.bind(null, post.id)}
          mode="edit"
          cancelHref={`/posts/${post.id}`}
          defaultValues={{ title: post.title, content: post.content, author: post.author }}
        />
      </CardContent>
    </Card>
  );
}
