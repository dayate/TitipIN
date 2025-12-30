<script lang="ts">
  import type { LayoutData } from './$types';
  import AdminSidebar from '$lib/components/AdminSidebar.svelte';
  import OwnerHeader from '$lib/components/OwnerHeader.svelte';

  let { data, children } = $props<{ data: LayoutData; children: any }>();

  let sidebarCollapsed = $state(false);
  let mobileOpen = $state(false);
</script>

<div class="min-h-screen bg-background">
  <AdminSidebar
    storeId={String(data.storeId)}
    storeName={data.storeName}
    logoUrl={data.logoUrl}
    bind:collapsed={sidebarCollapsed}
    bind:mobileOpen={mobileOpen}
  />

  <OwnerHeader
    storeName={data.storeName}
    userName={data.userName}
    userAvatar={data.userAvatar}
    collapsed={sidebarCollapsed}
  />

  <!-- Main Content -->
  <main
    class="transition-all duration-300 min-h-screen pt-14
      {sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}"
  >
    {@render children()}
  </main>
</div>
