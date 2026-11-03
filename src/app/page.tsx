import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { listPosts } from "@/lib/db";
import { formatListDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const requestedPage = Number(params.page);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { items, total } = await listPosts({ query, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">자유게시판</CardTitle>
          <CardDescription>
            {query ? `"${query}" 검색 결과 ${total}건` : `전체 ${total}개의 글`}
          </CardDescription>
        </div>
        <form action="/" className="flex w-full gap-2 sm:w-72">
          <Input name="q" defaultValue={query} placeholder="제목, 내용, 작성자 검색" aria-label="검색어" />
          <Button type="submit" variant="outline" size="icon" aria-label="검색">
            <SearchIcon />
          </Button>
        </form>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-16 text-center sm:table-cell">번호</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-28 text-center">작성자</TableHead>
              <TableHead className="hidden w-28 text-center sm:table-cell">작성일</TableHead>
              <TableHead className="hidden w-16 text-center sm:table-cell">조회</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {query ? "검색 결과가 없습니다." : "아직 작성된 글이 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="hidden text-center text-muted-foreground sm:table-cell">{post.id}</TableCell>
                  <TableCell className="max-w-0">
                    <Link href={`/posts/${post.id}`} className="flex items-center gap-2 hover:underline">
                      <span className="truncate">{post.title}</span>
                      {post.commentCount > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {post.commentCount}
                        </Badge>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="truncate text-center">{post.author}</TableCell>
                  <TableCell className="hidden text-center text-muted-foreground sm:table-cell">
                    {formatListDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-center text-muted-foreground sm:table-cell">{post.views}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <Pagination className="sm:mx-0 sm:w-auto">
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={pageHref(page - 1)} text="이전" />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href={pageHref(p)} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext href={pageHref(page + 1)} text="다음" />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          <Link href="/posts/new" className={buttonVariants()}>
            글쓰기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
