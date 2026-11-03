// Creates the board tables in the database at DATABASE_URL and seeds sample posts when empty.
// Usage: npm run db:init
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "crypto";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (see .env.example).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

await sql`
  CREATE TABLE IF NOT EXISTS posts (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(100) NOT NULL,
    content       TEXT NOT NULL,
    author        VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    views         INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

await sql`
  CREATE TABLE IF NOT EXISTS comments (
    id            SERIAL PRIMARY KEY,
    post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author        VARCHAR(20) NOT NULL,
    content       TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

await sql`CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments (post_id)`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`;
if (count === 0) {
  const hash = hashPassword("1234");
  const samples = [
    ["게시판에 오신 것을 환영합니다", "관리자", "자유롭게 글을 작성하고 댓글을 남겨보세요.\n\n글 작성 시 입력한 비밀번호로 수정과 삭제를 할 수 있습니다.", 3],
    ["Next.js 16 사용 후기", "개발자", "App Router와 Server Actions 조합이 정말 편리합니다.", 2],
    ["shadcn/ui 컴포넌트 추천", "디자이너", "Button, Card, Table, AlertDialog 정도면 게시판은 충분히 만들 수 있어요.", 1],
  ];
  for (const [title, author, content, hoursAgo] of samples) {
    await sql`
      INSERT INTO posts (title, content, author, password_hash, created_at, updated_at)
      VALUES (${title}, ${content}, ${author}, ${hash},
              now() - make_interval(hours => ${hoursAgo}), now() - make_interval(hours => ${hoursAgo}))`;
  }
  const [first] = await sql`SELECT id FROM posts ORDER BY id LIMIT 1`;
  await sql`
    INSERT INTO comments (post_id, author, content, password_hash)
    VALUES (${first.id}, '방문자', '첫 댓글입니다!', ${hash})`;
  console.log("Seeded sample posts (password: 1234).");
}

console.log("Database is ready.");
