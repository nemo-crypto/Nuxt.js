<script setup>
/** Services */
import { isPrefersDarkScheme } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const appConfig = useAppConfig()

const theme = useCookie("theme", { default: () => "dark" })
switch (theme.value) {
	case "dark":
	case "dimmed":
	case "light":
		appStore.theme = theme.value

		break

	case "system":
		appStore.theme = "system"

		break
}

onMounted(() => {
	let root = document.querySelector("html")

	if (appStore.theme === "system") {
		root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
	} else {
		root.setAttribute("theme", appStore.theme)
	}
})

watch(
	() => appStore.theme,
	() => {
		if (appStore.theme === "system") {
			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
				root.setAttribute("theme", isPrefersDarkScheme() ? "dark" : "light")
			})
		}
	},
)
</script>

<template>
	<div tag="footer" :class="$style.wrapper">
		<Flex justify="between" wide :class="$style.container">
			<div :class="$style.listLink">
				<div :class="$style.listLeft">
					<div :class="$style.listItem">
						<div :class="$style.listTitle">Nubit</div>
						<a class="hvr-forward" :href="`https://discord.gg/nubit`" target="_blank">Help center</a>
						<a class="hvr-forward" :href="`https://forms.gle/JAPvThUA8w182jFN6`" target="_blank">Feature request</a>
					</div>
					<div :class="$style.listItem">
						<div :class="$style.listTitle">Developers</div>
						<a class="hvr-forward" :href="`https://docs.nubit.org/developer-guides/introduction`" target="_blank"
							>Documentation</a
						>
						<a class="hvr-forward" :href="`https://github.com/RiemaLabs`" target="_blank">GitHub</a>
					</div>
				</div>
				<div :class="$style.listRight">
					<div :class="$style.listItem">
						<div :class="$style.listTitle">Community</div>
						<a class="hvr-forward" :href="`https://discord.gg/nubit`" target="_blank">Discord</a>
						<a class="hvr-forward" :href="`https://twitter.com/Nubit_org`" target="_blank">Twitter</a>
						<a class="hvr-forward" :href="`https://medium.com/@nubit_org`" target="_blank">Blog</a>
					</div>
					<div :class="$style.listItem">
						<div :class="$style.listTitle">About</div>
						<a
							class="hvr-forward"
							:href="`https://riema.notion.site/Riema-Labs-Branding-Resources-ac6cc1b6ee25484e8f645148d2d1316d`"
							target="_blank"
							>Brand assets</a
						>
						<a
							class="hvr-forward"
							:href="`https://drive.google.com/file/d/1xmKKcxxl5bQWXfPwEo-HTnQx6qz21wN3/view?usp=sharing`"
							target="_blank"
							>Privacy policy</a
						>
					</div>
				</div>
			</div>
		</Flex>

		<div :class="$style.listIntroinfo">
			<div :class="$style.desLink">
				<a class="hvr-pulse-grow" href="https://twitter.com/Nubit_org" target="_blank">
					<img width="20" height="20" src="/img/icon-twitter.svg" />
				</a>
				<a class="hvr-pulse-grow" href="https://discord.gg/nubit" target="_blank">
					<img width="24" height="24" src="/img/icon-discord2.svg" />
				</a>
				<a class="hvr-pulse-grow" href="https://github.com/RiemaLabs" target="_blank">
					<img width="24" height="24" src="/img/icon-github.svg" />
				</a>
			</div>
			<div :class="$style.descCom">© Copyright Nubit 2025. All Rights Reserved.</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	border-top: 2px solid var(--op-5);
}

.container {
	margin: auto;
	width: 1320px;
	padding: 50px 24px 30px 24px;

	.listLink {
		display: flex;
		width: 100%;

		.listLeft {
			display: flex;
			width: 50%;
			margin-bottom: 0px;

			.listItem {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 50%;
				margin-left: 80px;

				.listTitle {
					font-family: "Space Grotesk";
					font-weight: 600;
					font-size: 18px;
					color: #ffffff;
					line-height: 24px;
					text-align: left;
					font-style: normal;
					text-transform: none;
					margin-bottom: 17px;
				}

				a {
					font-family: "Space Grotesk";
					font-weight: 400;
					font-size: 16px;
					color: rgba(255, 255, 255, 0.8);
					line-height: 24px;
					text-align: left;
					font-style: normal;
					text-transform: none;
					cursor: pointer;
					margin-bottom: 14px;
				}

				a:hover {
					color: #f33928;
				}
			}
		}

		.listRight {
			display: flex;
			width: 50%;

			.listItem {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 50%;
				margin-left: 80px;

				.listTitle {
					font-family: "Space Grotesk";
					font-weight: 600;
					font-size: 18px;
					color: #ffffff;
					line-height: 24px;
					text-align: left;
					font-style: normal;
					text-transform: none;
					margin-bottom: 17px;
				}

				a {
					font-family: "Space Grotesk";
					font-weight: 400;
					font-size: 16px;
					color: rgba(255, 255, 255, 0.8);
					line-height: 24px;
					text-align: left;
					font-style: normal;
					text-transform: none;
					cursor: pointer;
					margin-bottom: 14px;
				}

				a:hover {
					color: #f33928;
				}
			}
		}
	}
}

.listIntroinfo {
	margin: auto;
	width: 1320px;
	padding: 24px 24px 50px 24px;
	display: flex;
	justify-content: space-between;

	a {
		margin-right: 15px;
	}

	.descCom {
		font-family: "Space Grotesk";
		font-weight: 400;
		font-size: 12px;
		color: #ffffff;
		line-height: 16px;
		text-align: right;
		font-style: normal;
		text-transform: none;
	}
}

@media (max-width: 600px) {
	.container {
		width: 100%;

		.listLink {
			display: block;
			width: 100%;

			.listLeft {
				width: 100%;
				margin-bottom: 40px;

				.listItem {
					margin-left: 30px;
				}
			}

			.listRight {
				width: 100%;

				.listItem {
					margin-left: 30px;
				}
			}
		}
	}

	.listIntroinfo {
		width: 100%;
		display: block;
		text-align: center;

		.descCom {
			text-align: center;
			margin-top: 20px;
		}
	}
}
</style>
