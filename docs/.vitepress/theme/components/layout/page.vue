<template>
	<LayoutHeader />
	<div class="container !max-w-screen-2xl lg:px-6 mx-auto pt-$header-height content">
		<Sidebar />
		<div class="grid px-6 md:px-8 py-8 lg:py-12 relative">
			<!-- <HomeHero /> -->
			<div class="prose min-w-0">
				<Content />
			</div>
			<LayoutFooter />
		</div>
		<SidebarRight />
	</div>
</template>

<style scoped lang="postcss">
.content {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 0px 12px;
}

@screen lg {
  .content {
    grid-template-columns: 250px 1fr 250px;
  }
}
</style>
