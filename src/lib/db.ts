import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  passwordHash: string;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: number;
  postId: number;
  author: string;
  content: string;
  passwordHash: string;
  createdAt: string;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

const sql = neon(process.env.DATABASE_URL);

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

type Row = Record<string, unknown>;

const iso = (value: unknown) => new Date(value as string | Date).toISOString();

function toPost(row: Row): Post {
  return {
    id: row.id as number,
    title: row.title as string,
    content: row.content as string,
    author: row.author as string,
    passwordHash: row.password_hash as string,
    views: row.views as number,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toComment(row: Row): Comment {
  return {
    id: row.id as number,
    postId: row.post_id as number,
    author: row.author as string,
    content: row.content as string,
    passwordHash: row.password_hash as string,
    createdAt: iso(row.created_at),
  };
}

export type PostSummary = Omit<Post, "passwordHash" | "content"> & { commentCount: number };

export async function listPosts({ query, page, pageSize }: { query: string; page: number; pageSize: number }) {
  const q = query.trim();
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const offset = (page - 1) * pageSize;

  const [rows, [{ total }]] = await Promise.all([
    sql`
      SELECT p.id, p.title, p.author, p.views, p.created_at, p.updated_at,
             (SELECT count(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      WHERE ${q} = '' OR p.title ILIKE ${pattern} OR p.content ILIKE ${pattern} OR p.author ILIKE ${pattern}
      ORDER BY p.id DESC
      LIMIT ${pageSize} OFFSET ${offset}`,
    sql`
      SELECT count(*)::int AS total
      FROM posts p
      WHERE ${q} = '' OR p.title ILIKE ${pattern} OR p.content ILIKE ${pattern} OR p.author ILIKE ${pattern}`,
  ]);

  const items: PostSummary[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    views: row.views,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    commentCount: row.comment_count,
  }));
  return { items, total: total as number };
}

export async function getPost(id: number) {
  const [row] = await sql`SELECT * FROM posts WHERE id = ${id}`;
  return row ? toPost(row) : null;
}

export async function getPostWithComments(id: number, { countView = false } = {}) {
  const [postRows, commentRows] = await Promise.all([
    countView
      ? sql`UPDATE posts SET views = views + 1 WHERE id = ${id} RETURNING *`
      : sql`SELECT * FROM posts WHERE id = ${id}`,
    sql`SELECT * FROM comments WHERE post_id = ${id} ORDER BY id`,
  ]);
  if (!postRows[0]) return null;
  return { post: toPost(postRows[0]), comments: commentRows.map(toComment) };
}

export async function insertPost(data: Pick<Post, "title" | "content" | "author"> & { password: string }) {
  const [row] = await sql`
    INSERT INTO posts (title, content, author, password_hash)
    VALUES (${data.title}, ${data.content}, ${data.author}, ${hashPassword(data.password)})
    RETURNING *`;
  return toPost(row);
}

async function checkPostPassword(id: number, password: string) {
  const [row] = await sql`SELECT password_hash FROM posts WHERE id = ${id}`;
  if (!row) return "not_found" as const;
  if (!verifyPassword(password, row.password_hash)) return "wrong_password" as const;
  return "ok" as const;
}

export async function updatePostById(id: number, password: string, data: Pick<Post, "title" | "content">) {
  const check = await checkPostPassword(id, password);
  if (check !== "ok") return check;
  await sql`
    UPDATE posts SET title = ${data.title}, content = ${data.content}, updated_at = now()
    WHERE id = ${id}`;
  return "ok" as const;
}

export async function deletePostById(id: number, password: string) {
  const check = await checkPostPassword(id, password);
  if (check !== "ok") return check;
  // Comments go with it via ON DELETE CASCADE.
  await sql`DELETE FROM posts WHERE id = ${id}`;
  return "ok" as const;
}

export async function insertComment(data: Pick<Comment, "postId" | "author" | "content"> & { password: string }) {
  const [row] = await sql`
    INSERT INTO comments (post_id, author, content, password_hash)
    SELECT ${data.postId}, ${data.author}, ${data.content}, ${hashPassword(data.password)}
    WHERE EXISTS (SELECT 1 FROM posts WHERE id = ${data.postId})
    RETURNING *`;
  return row ? toComment(row) : null;
}

export async function deleteCommentById(id: number, password: string) {
  const [row] = await sql`SELECT post_id, password_hash FROM comments WHERE id = ${id}`;
  if (!row) return { result: "not_found" as const };
  if (!verifyPassword(password, row.password_hash)) return { result: "wrong_password" as const };
  await sql`DELETE FROM comments WHERE id = ${id}`;
  return { result: "ok" as const, postId: row.post_id as number };
}
