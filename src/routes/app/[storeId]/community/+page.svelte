<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Loader2, ArrowLeft, Plus, MessageSquare, Send } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let showPostForm = $state(false);
  let title = $state('');
  let content = $state('');
  let loading = $state(false);

  // Comment state per post
  let commentText = $state<Record<number, string>>({});
  let commentLoading = $state<Record<number, boolean>>({});

  async function handleSubmitPost() {
    if (!title || !content) {
      toast.error('Judul dan isi wajib diisi');
      return;
    }

    loading = true;

    try {
      const res = await fetch(`/api/community/local/${data.storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat postingan');
        return;
      }

      toast.success('Postingan berhasil dibuat!');
      title = '';
      content = '';
      showPostForm = false;
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }

  async function handleSubmitComment(postId: number) {
    const text = commentText[postId];
    if (!text?.trim()) {
      toast.error('Tulis komentar terlebih dahulu');
      return;
    }

    commentLoading[postId] = true;

    try {
      const res = await fetch(`/api/community/local/${data.storeId}/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengirim komentar');
        return;
      }

      toast.success('Komentar berhasil dikirim!');
      commentText[postId] = '';
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      commentLoading[postId] = false;
    }
  }
</script>

<div class="p-6">
  <!-- Back Button -->
  <Button variant="ghost" href="/app/{data.storeId}" class="mb-4">
    <ArrowLeft class="h-4 w-4 mr-2" />
    Kembali
  </Button>

  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold">Komunitas Lapak</h1>
      <p class="text-muted-foreground">{data.store?.name}</p>
    </div>
    <!-- Only owner can create posts -->
    {#if data.isOwner && !showPostForm}
      <Button onclick={() => showPostForm = true}>
        <Plus class="h-4 w-4 mr-2" />
        Buat Pengumuman
      </Button>
    {/if}
  </div>

  <!-- Post Form (Owner Only) -->
  {#if showPostForm && data.isOwner}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Buat Pengumuman Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onsubmit={(e) => { e.preventDefault(); handleSubmitPost(); }} class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium mb-1">Judul</label>
            <Input id="title" bind:value={title} placeholder="Judul pengumuman" disabled={loading} />
          </div>
          <div>
            <label for="content" class="block text-sm font-medium mb-1">Isi</label>
            <textarea
              id="content"
              bind:value={content}
              placeholder="Tulis isi pengumuman..."
              class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            ></textarea>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" onclick={() => showPostForm = false} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} class="flex-1">
              {#if loading}
                <Loader2 class="h-4 w-4 animate-spin mr-2" />
              {/if}
              Posting
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  {/if}

  <!-- Info for non-owners -->
  {#if !data.isOwner}
    <div class="bg-accent/50 border rounded-lg p-4 mb-6 text-center">
      <p class="text-sm text-muted-foreground">
        Hanya pemilik lapak yang bisa membuat pengumuman. Anda bisa mengomentari pengumuman di bawah.
      </p>
    </div>
  {/if}

  <!-- Posts List -->
  {#if data.posts && data.posts.length > 0}
    <div class="space-y-4">
      {#each data.posts as post}
        <Card>
          <CardContent class="pt-6">
            <!-- Post Header -->
            <div class="flex items-start gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {#if post.authorAvatar}
                  <img src={post.authorAvatar} alt="" class="w-10 h-10 rounded-full object-cover" />
                {:else}
                  <span class="text-sm font-medium text-primary">
                    {post.authorName?.charAt(0) || '?'}
                  </span>
                {/if}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium">{post.authorName || 'Anonim'}</p>
                  <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Pemilik</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {#if post.isPinned}
                <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded">📌 Disematkan</span>
              {/if}
            </div>

            <!-- Post Content -->
            <h3 class="font-semibold mb-2">{post.title}</h3>
            <p class="text-sm text-muted-foreground whitespace-pre-line">{post.content}</p>
            {#if post.imageUrl}
              <img src={post.imageUrl} alt="" class="mt-3 rounded-lg max-h-64 object-cover" />
            {/if}

            <!-- Comments Section -->
            <div class="mt-4 pt-4 border-t">
              <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
                <MessageSquare class="h-4 w-4" />
                Komentar
              </h4>

              <!-- Comments List -->
              {#if post.comments && post.comments.length > 0}
                <div class="space-y-3 mb-4">
                  {#each post.comments as comment}
                    <div class="flex items-start gap-2 bg-accent/30 rounded-lg p-3">
                      <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span class="text-xs font-medium">
                          {comment.authorName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-medium">{comment.authorName}</p>
                          <span class="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p class="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-muted-foreground mb-4">Belum ada komentar</p>
              {/if}

              <!-- Comment Form -->
              <div class="flex gap-2">
                <Input
                  bind:value={commentText[post.id]}
                  placeholder="Tulis komentar..."
                  disabled={commentLoading[post.id]}
                  class="flex-1"
                />
                <Button
                  size="icon"
                  onclick={() => handleSubmitComment(post.id)}
                  disabled={commentLoading[post.id]}
                >
                  {#if commentLoading[post.id]}
                    <Loader2 class="h-4 w-4 animate-spin" />
                  {:else}
                    <Send class="h-4 w-4" />
                  {/if}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <MessageSquare class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p class="text-muted-foreground">Belum ada pengumuman di komunitas lapak ini</p>
        {#if data.isOwner}
          <Button class="mt-4" onclick={() => showPostForm = true}>
            Buat Pengumuman Pertama
          </Button>
        {/if}
      </CardContent>
    </Card>
  {/if}
</div>
