"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  generateBlogPost,
  suggestBlogTopics,
  getAiMemoryData,
  updateBrandVoice,
  updatePerformanceNotes,
  getSavedTopics,
  saveAllTopics,
  removeSavedTopic,
  saveTopic,
  type BlogPostData,
  type SavedTopic,
} from "@/actions/blog";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Eye,
  Send,
  Brain,
  Lightbulb,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function BlogAdmin() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostData | null>(null);
  const [showDelete, setShowDelete] = useState<BlogPostData | null>(null);
  const [showAiGen, setShowAiGen] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  const loadPosts = useCallback(async () => {
    const data = await getBlogPosts();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Blog</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMemory(true)}
          >
            <Brain className="mr-1 h-4 w-4" /> AI Memory
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTopics(true)}
          >
            <Lightbulb className="mr-1 h-4 w-4" /> Suggest Topics
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAiGen(true)}
          >
            <Sparkles className="mr-1 h-4 w-4" /> AI Generate
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingPost(null);
              setShowEditor(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No blog posts yet. Create one or use AI to generate.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : "secondary"
                        }
                        className="shrink-0"
                      >
                        {post.status}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{post.readingTime} min read</span>
                      <span>{post.tags.join(", ")}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {post.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingPost(post);
                        setShowEditor(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setShowDelete(post)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showEditor && (
        <PostEditor
          post={editingPost}
          open={showEditor}
          onOpenChange={setShowEditor}
          onSuccess={loadPosts}
        />
      )}

      {showAiGen && (
        <AiGenerator
          open={showAiGen}
          onOpenChange={setShowAiGen}
          onGenerated={(post) => {
            setShowAiGen(false);
            setEditingPost(null);
            setShowEditor(true);
            // Pre-fill handled by storing in sessionStorage
            sessionStorage.setItem("blogDraft", JSON.stringify(post));
          }}
        />
      )}

      {showTopics && (
        <TopicSuggester
          open={showTopics}
          onOpenChange={setShowTopics}
          onGenerateFromTopic={() => {
            setShowTopics(false);
            setEditingPost(null);
            setShowEditor(true);
          }}
        />
      )}
      {showMemory && (
        <AiMemoryPanel open={showMemory} onOpenChange={setShowMemory} />
      )}

      <ResponsiveDialog
        open={!!showDelete}
        onOpenChange={() => setShowDelete(null)}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Post</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete <strong>{showDelete?.title}</strong>? This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  if (!showDelete) return;
                  await deleteBlogPost(showDelete.id);
                  toast.success("Post deleted");
                  setShowDelete(null);
                  loadPosts();
                }}
              >
                Delete
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}

// ── Post Editor ──

function PostEditor({
  post,
  open,
  onOpenChange,
  onSuccess,
}: {
  post: BlogPostData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const draft =
    typeof window !== "undefined" ? sessionStorage.getItem("blogDraft") : null;
  const prefill = draft ? JSON.parse(draft) : null;

  const [title, setTitle] = useState(post?.title ?? prefill?.title ?? "");
  const [content, setContent] = useState(
    post?.content ?? prefill?.content ?? "",
  );
  const [excerpt, setExcerpt] = useState(
    post?.excerpt ?? prefill?.excerpt ?? "",
  );
  const [tags, setTags] = useState(
    post?.tags.join(", ") ?? prefill?.tags?.join(", ") ?? "",
  );
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(
    post?.seoTitle ?? prefill?.seoTitle ?? "",
  );
  const [seoDesc, setSeoDesc] = useState(
    post?.seoDescription ?? prefill?.seoDescription ?? "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefill) sessionStorage.removeItem("blogDraft");
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      tags: tags
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      status,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDesc.trim(),
    };

    const result = post?.id
      ? await updateBlogPost(post.id, data)
      : await createBlogPost(data);

    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(post ? "Post updated" : "Post created");
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {post ? "Edit Post" : "New Post"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div className="grid gap-2">
            <Label>Excerpt</Label>
            <Input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short preview text"
            />
          </div>
          <div className="grid gap-2">
            <Label>Content (Markdown)</Label>
            <textarea
              className="min-h-[300px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in Markdown..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="budgeting, savings, tips"
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>SEO Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Max 60 chars"
              />
            </div>
            <div className="grid gap-2">
              <Label>SEO Description</Label>
              <Input
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Max 155 chars"
              />
            </div>
          </div>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {post ? "Update" : "Create"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ── AI Generator ──

function AiGenerator({
  open,
  onOpenChange,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerated: (post: {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  }) => void;
}) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("helpful");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateBlogPost({
      topic,
      tone,
      targetKeywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      length,
    });
    setGenerating(false);

    if ("error" in result) {
      toast.error(result.error);
    } else if (result.post) {
      toast.success(result.imageGenerated ? "Post + infographic generated!" : "Post generated (no image — check DALL-E access)");
      onGenerated(result.post);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>AI Blog Generator</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Topic</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to save money on groceries"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Helpful</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="data-driven">Data-Driven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Length</Label>
              <Select
                value={length}
                onValueChange={(v) =>
                  setLength(v as "short" | "medium" | "long")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (800-1200)</SelectItem>
                  <SelectItem value="medium">Medium (1500-2500)</SelectItem>
                  <SelectItem value="long">Long (3000-4000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Target Keywords (optional)</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="budget app, expense tracker, free"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
            >
              {generating ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-4 w-4" />
              )}
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ── Topic Suggester ──

function TopicSuggester({
  open,
  onOpenChange,
  onGenerateFromTopic,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerateFromTopic?: (topic: string, keywords: string[]) => void;
}) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [newTopic, setNewTopic] = useState("");

  // Load saved topics from DB on mount
  useEffect(() => {
    getSavedTopics().then((saved) => {
      setTopics(saved);
      setInitialLoading(false);
    });
  }, []);

  // Save to DB whenever topics change (after initial load)
  const saveToDb = useCallback(async (updated: SavedTopic[]) => {
    await saveAllTopics(updated);
  }, []);

  const handleSuggest = async () => {
    setLoading(true);
    const result = await suggestBlogTopics();
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      const newTopics = result.topics ?? [];
      setTopics((prev) => {
        const merged = [...prev, ...newTopics];
        saveToDb(merged);
        return merged;
      });
    }
  };

  const handleRemove = (idx: number) => {
    setTopics((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      saveToDb(updated);
      return updated;
    });
  };

  const handleAddCustom = () => {
    if (!newTopic.trim()) return;
    const custom: SavedTopic = {
      title: newTopic.trim(),
      keywords: [],
      description: "Custom topic",
    };
    setTopics((prev) => {
      const updated = [custom, ...prev];
      saveToDb(updated);
      return updated;
    });
    setNewTopic("");
  };

  const handleGenerate = async (idx: number) => {
    const topic = topics[idx];
    setGeneratingIdx(idx);
    const result = await generateBlogPost({
      topic: topic.title,
      targetKeywords: topic.keywords,
      length: "medium",
    });
    setGeneratingIdx(null);

    if ("error" in result) {
      toast.error(result.error);
    } else if (result.post) {
      toast.success(result.imageGenerated ? "Post + infographic generated!" : "Post generated (no image)");
      sessionStorage.setItem("blogDraft", JSON.stringify(result.post));
      // Remove from DB
      setTopics((prev) => {
        const updated = prev.filter((_, i) => i !== idx);
        saveToDb(updated);
        return updated;
      });
      onOpenChange(false);
      onGenerateFromTopic?.(topic.title, topic.keywords);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Topic Suggestions</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* Add custom topic */}
        <div className="flex gap-2 pt-2">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add your own topic..."
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddCustom}
            disabled={!newTopic.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {initialLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <div className="py-8 text-center">
            <Button onClick={handleSuggest} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-1 h-4 w-4" />
              )}
              {loading ? "Thinking..." : "Get AI Suggestions"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {topics.map((t, i) => (
              <div
                key={`${t.title}-${i}`}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {t.keywords.map((k: string) => (
                      <Badge key={k} variant="outline" className="text-[10px]">
                        {k}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={generatingIdx !== null}
                    onClick={() => handleGenerate(i)}
                  >
                    {generatingIdx === i ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3 w-3" />
                    )}
                    {generatingIdx === i ? "Writing..." : "Generate"}
                  </Button>
                </div>
              </div>
            ))}

            {/* Load more */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSuggest}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-1 h-4 w-4" />
              )}
              {loading ? "Loading more..." : "Suggest More Topics"}
            </Button>
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ── AI Memory Panel ──

function AiMemoryPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [brandVoice, setBrandVoice] = useState("");
  const [perfNotes, setPerfNotes] = useState("");
  const [pastTopics, setPastTopics] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAiMemoryData().then((mem) => {
      setBrandVoice(mem.brandVoice ?? "");
      setPerfNotes(mem.performanceNotes ?? "");
      setPastTopics(mem.pastTopics ?? "");
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      updateBrandVoice(brandVoice),
      updatePerformanceNotes(perfNotes),
    ]);
    setSaving(false);
    toast.success("AI memory updated");
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>AI Memory</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        {loading ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Brand Voice</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Describe the tone, style, and personality of blog posts..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Performance Notes</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={perfNotes}
                onChange={(e) => setPerfNotes(e.target.value)}
                placeholder="What kind of posts performed well? Any lessons learned?"
              />
            </div>
            <div className="grid gap-2">
              <Label>Past Topics (auto-updated)</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-xs font-mono text-muted-foreground"
                value={pastTopics}
                readOnly
              />
            </div>
          </div>
        )}
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Save Memory
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
