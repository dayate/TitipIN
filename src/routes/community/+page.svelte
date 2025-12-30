<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Loader2, Plus, MessageSquare, Image } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let showForm = $state(false);
  let title = $state('');
  let content = $state('');
  let imageUrl = $state('');
  let loading = $state(false);

  async function handleSubmit() {
    if (!title || !content) {
      toast.error('Judul dan isi wajib diisi');
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/community/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat postingan');
        return;
      }

      toast.success('Postingan berhasil dibuat!');
      title = '';
      content = '';
      imageUrl = '';
      showForm = false;

      // Reload posts
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-6 max-w-2xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold">Komunitas</h1>
      <p class="text-muted-foreground">Forum diskusi seluruh pengguna</p>
    </div>
    {#if data.user && !showForm}
      <Button onclick={() => showForm = true}>
        <Plus class="h-4 w-4 mr-2" />
        Buat Post
      </Button>
    {/if}
  </div>

  <!-- Post Form -->
  {#if showForm}
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Buat Postingan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium mb-1">Judul</label>
            <Input id="title" bind:value={title} placeholder="Judul postingan" disabled={loading} />
          </div>
          <div>
            <label for="content" class="block text-sm font-medium mb-1">Isi</label>
            <textarea
              id="content"
              bind:value={content}
              placeholder="Tulis isi postingan..."
              class="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={loading}
            ></textarea>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" onclick={() => showForm = false} disabled={loading}>
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

  <!-- Posts List -->
  {#if data.posts && data.posts.length > 0}
    <div class="space-y-4">
      {#each data.posts as post}
        <Card>
          <CardContent class="pt-6">
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
                <p class="font-medium">{post.authorName || 'Anonim'}</p>
                <p class="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <h3 class="font-semibold mb-2">{post.title}</h3>
            <p class="text-sm text-muted-foreground whitespace-pre-line">{post.content}</p>
            {#if post.imageUrl}
              <img src={post.imageUrl} alt="" class="mt-3 rounded-lg max-h-64 object-cover" />
            {/if}
            <div class="flex items-center gap-4 mt-4 pt-4 border-t">
              <a href="/community/{post.id}" class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <MessageSquare class="h-4 w-4" />
                Komentar
              </a>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <MessageSquare class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p class="text-muted-foreground">Belum ada postingan</p>
      </CardContent>
    </Card>
  {/if}
</div>
