<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
  } from '$lib/components/ui/dialog';
  import {
    MessageSquare, Plus, Pin, Edit, Trash2, User, Image
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let { data } = $props<{ data: PageData }>();

  let isLoading = $state(false);
  let showCreateDialog = $state(false);
  let showEditDialog = $state(false);
  let editingPost = $state<any>(null);

  // Form states
  let newTitle = $state('');
  let newContent = $state('');
  let newImageUrl = $state('');

  async function createPost() {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Judul dan isi wajib diisi');
      return;
    }

    isLoading = true;
    try {
      const res = await fetch(`/api/community/local/${data.storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          imageUrl: newImageUrl || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal membuat post');
        return;
      }

      toast.success('Post berhasil dibuat!');
      showCreateDialog = false;
      newTitle = '';
      newContent = '';
      newImageUrl = '';
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  function openEditDialog(post: any) {
    editingPost = post;
    newTitle = post.title;
    newContent = post.content;
    newImageUrl = post.imageUrl || '';
    showEditDialog = true;
  }

  async function updatePost() {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Judul dan isi wajib diisi');
      return;
    }

    isLoading = true;
    try {
      const res = await fetch(`/api/community/local/${data.storeId}/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          imageUrl: newImageUrl || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengupdate post');
        return;
      }

      toast.success('Post berhasil diupdate!');
      showEditDialog = false;
      editingPost = null;
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  async function deletePost(postId: number) {
    if (!confirm('Yakin ingin menghapus post ini?')) return;

    isLoading = true;
    try {
      const res = await fetch(`/api/community/local/${data.storeId}/${postId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal menghapus post');
        return;
      }

      toast.success('Post berhasil dihapus!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  async function togglePin(post: any) {
    isLoading = true;
    try {
      const res = await fetch(`/api/community/local/${data.storeId}/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Gagal mengupdate');
        return;
      }

      toast.success(post.isPinned ? 'Post tidak lagi disematkan' : 'Post disematkan!');
      location.reload();
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      isLoading = false;
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="p-6 pt-16 lg:pt-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <MessageSquare class="h-6 w-6" />
        Komunitas Lapak
      </h1>
      <p class="text-muted-foreground">{data.store?.name}</p>
    </div>
    <Button onclick={() => showCreateDialog = true}>
      <Plus class="h-4 w-4 mr-2" />
      Buat Post
    </Button>
  </div>

  <!-- Info -->
  <Card class="mb-6 border-blue-500/30 bg-blue-500/5">
    <CardContent class="pt-4">
      <p class="text-sm text-muted-foreground">
        📢 Post di komunitas ini hanya bisa dibuat oleh pemilik lapak. Anggota hanya bisa melihat dan berkomentar.
      </p>
    </CardContent>
  </Card>

  <!-- Posts -->
  {#if data.posts && data.posts.length > 0}
    <div class="space-y-4">
      {#each data.posts as post}
        <Card class={post.isPinned ? 'border-primary/50' : ''}>
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {#if post.authorAvatar}
                    <img src={post.authorAvatar} alt="" class="w-full h-full object-cover" />
                  {:else}
                    <User class="h-5 w-5 text-muted-foreground" />
                  {/if}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <CardTitle class="text-base">{post.title}</CardTitle>
                    {#if post.isPinned}
                      <Badge variant="secondary" class="text-xs">
                        <Pin class="h-3 w-3 mr-1" />
                        Disematkan
                      </Badge>
                    {/if}
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {post.authorName} · {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => togglePin(post)}
                  disabled={isLoading}
                  title={post.isPinned ? 'Hapus sematkan' : 'Sematkan'}
                >
                  <Pin class="h-4 w-4 {post.isPinned ? 'text-primary' : ''}" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => openEditDialog(post)}
                  disabled={isLoading}
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => deletePost(post.id)}
                  disabled={isLoading}
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {#if post.imageUrl}
              <img
                src={post.imageUrl}
                alt=""
                class="w-full max-h-64 object-cover rounded-lg mb-3"
              />
            {/if}
            <p class="text-sm whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else}
    <Card>
      <CardContent class="py-12 text-center">
        <MessageSquare class="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p class="text-muted-foreground">Belum ada post di komunitas</p>
        <Button class="mt-4" onclick={() => showCreateDialog = true}>
          <Plus class="h-4 w-4 mr-2" />
          Buat Post Pertama
        </Button>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Create Post Dialog -->
<Dialog bind:open={showCreateDialog}>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Buat Post Baru</DialogTitle>
    </DialogHeader>
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="title">Judul</Label>
        <Input id="title" bind:value={newTitle} placeholder="Judul post..." />
      </div>
      <div class="space-y-2">
        <Label for="content">Isi</Label>
        <textarea
          id="content"
          bind:value={newContent}
          placeholder="Tulis isi post..."
          rows="5"
          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ></textarea>
      </div>
      <div class="space-y-2">
        <Label for="imageUrl">URL Gambar (opsional)</Label>
        <Input id="imageUrl" bind:value={newImageUrl} placeholder="https://..." />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => showCreateDialog = false}>
        Batal
      </Button>
      <Button onclick={createPost} disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : 'Buat Post'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Edit Post Dialog -->
<Dialog bind:open={showEditDialog}>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Edit Post</DialogTitle>
    </DialogHeader>
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="edit-title">Judul</Label>
        <Input id="edit-title" bind:value={newTitle} placeholder="Judul post..." />
      </div>
      <div class="space-y-2">
        <Label for="edit-content">Isi</Label>
        <textarea
          id="edit-content"
          bind:value={newContent}
          placeholder="Tulis isi post..."
          rows="5"
          class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ></textarea>
      </div>
      <div class="space-y-2">
        <Label for="edit-imageUrl">URL Gambar (opsional)</Label>
        <Input id="edit-imageUrl" bind:value={newImageUrl} placeholder="https://..." />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => showEditDialog = false}>
        Batal
      </Button>
      <Button onclick={updatePost} disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

