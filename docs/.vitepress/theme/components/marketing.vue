<script setup lang="ts">
interface Feature {
	title: string
	description: string
	url?: string
	icon?: string
}

const features: Feature[] = []
</script>

<template>
	<ClientOnly>
		<section class="mx-auto mt-20 flex h-full w-full max-w-5xl grow flex-col justify-center lg:mt-40">
			<!-- Hero -->
			<div class="flex w-full flex-col items-center justify-between gap-x-40 px-6 lg:flex-row lg:items-start lg:px-0">
				<!-- Left block -->
				<section class="max-w-2xl grow">
					<!-- Title -->
					<h1 class="title font-title title-bg bg-clip-text text-center text-5xl font-medium uppercase text-transparent lg:text-left lg:text-8xl">
						Preset
					</h1>
					<!-- Subtitle -->
					<p class="mt-2 text-center text-2xl font-medium lg:text-left lg:text-3xl">
						Elegant, ecosystem-agnostic preset mechanism.
					</p>
					<!-- Description -->
					<p class="mt-4 text-center text-lg font-medium opacity-60 lg:text-left lg:text-2xl">
						Kickstart your projects by applying specialized presets after scaffolding them.
					</p>
					<!-- Actions -->
					<div class="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
						<a
							class="px-4.5 group flex items-center rounded-full bg-[#dbeafe] py-2.5 text-sm font-semibold text-[#1e3a8a] transition hover:bg-[#bfdbfe]/80 dark:bg-[var(--vp-c-brand-light)] dark:text-[var(--vp-c-bg)] dark:hover:bg-[var(--vp-c-brand-lighter)] dark:hover:text-[var(--vp-c-bg)]"
							href="/introduction.html"
						>
							Get started
							<svg
								class="ml-2 transition group-hover:translate-x-1"
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								viewBox="0 0 24 24"
							>
								<path
									d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"
									fill="currentcolor"
								/>
							</svg>
						</a>
						<a
							class="px-4.5 group flex items-center rounded-full border border-[var(--vp-button-alt-border)] bg-[var(--vp-c-bg-soft)] py-2 text-sm font-medium text-[var(--vp-c-text-1)] transition hover:bg-[var(--vp-c-bg-mute)]"
							href="https://github.com/preset/preset"
						>
							See on GitHub
						</a>
					</div>
				</section>

				<!-- Logo block -->
				<div class="lg:h-55 lg:w-55 h-30 w-30 relative order-first mb-20 flex shrink-0 items-center justify-center lg:order-last lg:mt-20 lg:mr-20">
					<img class="absolute z-[1] h-full w-full" src="/logo.svg" />
					<div class="image-bg absolute -inset-5 rotate-45 opacity-40 dark:opacity-70" />
				</div>
			</div>

			<!-- Features -->
			<section v-if="false" class="mt-24 grid grid-cols-1 gap-8 px-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-0">
				<template v-for="feature in features" :key="feature.title">
					<component
						:is="feature.url ? 'a' : 'div'"
						class="group relative flex flex-col justify-center gap-4 rounded-lg bg-[var(--vp-c-bg-soft)] p-6"
						:class="{
							'transition cursor-pointer hover:bg-[var(--vp-c-bg-mute)]': feature.url
						}"
						:href="feature.url"
					>
						<div class="h-25 w-25 absolute right-5 flex shrink-0 items-center justify-center rounded p-2">
							<div :class="feature.icon" class="h-full w-full text-[var(--vp-c-text-2)] opacity-0 transition group-hover:opacity-5 dark:group-hover:opacity-10" />
						</div>
						<div>
							<span class="font-semibold" v-text="feature.title" />
							<!-- eslint-disable-next-line vue/no-v-html -->
							<p class="mt-2 text-sm font-medium leading-relaxed text-[var(--vp-c-text-2)]" v-html="feature.description" />
						</div>
					</component>
				</template>
			</section>
		</section>
	</ClientOnly>
</template>

<style scoped>
.title-bg {
	animation: title-gradient 20s ease infinite;
	background-size: 400% 400%;
  background-image: linear-gradient(
		-45deg,
		var(--vp-logo-shadow-1),
		var(--vp-logo-shadow-2),
		var(--vp-logo-shadow-3),
		var(--vp-logo-shadow-4),
		var(--vp-logo-shadow-2),
		var(--vp-logo-shadow-4),
		var(--vp-logo-shadow-3),
		var(--vp-logo-shadow-2)
	);
}

@keyframes title-gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

.image-bg {
  filter: blur(40px);
	animation: image-gradient 10s ease infinite;
	background-size: 400% 400%;
  background-image: linear-gradient(
		-45deg,
		var(--vp-logo-shadow-1),
		var(--vp-logo-shadow-2),
		var(--vp-logo-shadow-3),
		var(--vp-logo-shadow-4),
		var(--vp-logo-shadow-2),
		var(--vp-logo-shadow-4),
		var(--vp-logo-shadow-3),
		var(--vp-logo-shadow-2)
	);
}

@keyframes image-gradient {
	0% {
		background-position: 0% 50%;
		border-radius: 75px;
		transform: rotate(0deg);
	}
	50% {
		background-position: 100% 50%;
		border-radius: 150px;
		transform: rotate(100deg);
	}
	100% {
		background-position: 0% 50%;
		border-radius: 75px;
		transform: rotate(00deg);
	}
}

.title::selection {
	background-color: rgba(244, 114, 182, 0.2);
	color: white;
}
</style>
