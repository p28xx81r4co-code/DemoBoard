# 게시판

Next.js 16 (App Router) · shadcn/ui · TypeScript로 만든 웹 게시판입니다.

## 기능

- 글 목록: 페이지네이션(10개씩), 제목·내용·작성자 검색, 댓글 수·조회수 표시
- 글쓰기 / 상세 보기 / 수정 / 삭제
- 댓글 작성 · 삭제
- 로그인 없는 익명 게시판 방식: 작성 시 입력한 비밀번호(scrypt 해시 저장)로 수정·삭제
- 입력값 검증(서버 액션), 오류 시 입력 내용 유지, 토스트 알림

## 실행

`.env.example`을 `.env.local`로 복사하고 `DATABASE_URL`에 Neon(PostgreSQL) 연결 문자열을 넣은 뒤:

```bash
npm install
npm run db:init   # 테이블 생성 + 비어 있으면 샘플 글 추가
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 구조

```
src/
  app/
    actions.ts            서버 액션 (생성·수정·삭제, 검증)
    page.tsx              글 목록
    posts/new/            글쓰기
    posts/[id]/           글 상세 + 댓글
    posts/[id]/edit/      글 수정
  components/             폼, 삭제 다이얼로그, shadcn/ui 컴포넌트(ui/)
  lib/db.ts               Neon(PostgreSQL) 쿼리
scripts/init-db.mjs       테이블 생성·샘플 데이터
```

## 데이터

데이터는 Neon PostgreSQL의 `posts`, `comments` 테이블에 저장됩니다.
글을 삭제하면 댓글도 함께 삭제됩니다(`ON DELETE CASCADE`). 샘플 글의 비밀번호는 `1234`입니다.
