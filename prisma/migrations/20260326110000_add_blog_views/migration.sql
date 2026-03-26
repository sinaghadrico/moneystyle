-- CreateTable
CREATE TABLE IF NOT EXISTS "blog_post_views" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_post_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "blog_post_views_postId_fingerprint_key" ON "blog_post_views"("postId", "fingerprint");
CREATE INDEX IF NOT EXISTS "blog_post_views_postId_idx" ON "blog_post_views"("postId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "blog_post_views" ADD CONSTRAINT "blog_post_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
