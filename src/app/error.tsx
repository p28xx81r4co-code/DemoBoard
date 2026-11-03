"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">페이지를 불러오지 못했습니다</h1>
      <p className="text-muted-foreground">
        일시적인 서버 오류일 수 있습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>다시 시도</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          목록으로
        </Link>
      </div>
    </div>
  );
}
