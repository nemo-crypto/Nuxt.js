<script setup>
/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const handleActionCallback = (callback, notification) => {
	callback()

	notificationsStore.remove({ id: notification.id })
}
</script>

<template>
	<div :class="$style.wrapper">
		<Flex direction="column" gap="4" :class="$style.notifications">
			<TransitionGroup name="fade">
				<div
					v-for="notification in notificationsStore.items"
					:key="notification.id"
					id="notification"
					:class="[$style.notification]"
				>
					<Icon
						v-if="notification.type || notification.icon"
						:name="notification.icon"
						size="14"
						:class="[$style.general_icon, $style[notification.type]]"
					/>

					<Flex direction="column">
						<Text size="13" weight="600" color="primary" style="line-height: 14px">
							{{ notification.title }}
						</Text>

						<div v-if="notification.description" :class="$style.description">
							{{ notification.description }}
						</div>

						<div v-if="notification.badges" :class="$style.badges">
							<div v-for="(badge, bIndex) in notification.badges" :key="bIndex" :class="$style.badge">
								<Icon
									:name="badge.icon"
									size="16"
									:style="{
										fill: `var(--${badge.iconColor})`,
									}"
								/>
								<span v-if="badge.secondaryText" :class="$style.secondary">{{ badge.secondaryText }}</span>
								<span v-if="badge.tertiaryText" :class="$style.tertiary">{{ badge.tertiaryText }}</span>
							</div>
						</div>

						<Flex v-if="notification.actions" align="center" gap="6" :class="$style.actions">
							<Flex
								v-for="(action, aIndex) in notification.actions"
								:key="aIndex"
								@click="handleActionCallback(action.callback, notification)"
								align="center"
								gap="6"
								:class="$style.action"
							>
								<Icon v-if="action.icon" :name="action.icon" color="tertiary" size="12" />
								<Text size="12" weight="600" color="secondary">{{ action.name }}</Text>
							</Flex>
						</Flex>
					</Flex>

					<Icon
						@click="notificationsStore.remove({ id: notification.id })"
						name="close-circle"
						size="12"
						:class="$style.close_icon"
					/>
				</div>
			</TransitionGroup>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	position: fixed;
	bottom: 16px;
	right: 16px;

	z-index: 1002;
}

.notifications {
	position: relative;
}

@keyframes slidein {
	from {
		transform: translateY(50px);
		opacity: 0;
	}

	to {
		transform: 0;
		opacity: 1;
	}
}

.notification {
	display: flex;
	gap: 10px;

	box-sizing: border-box;
	width: 330px;
	background: var(--card-background);
	box-shadow: inset 0 0 0 2px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

	border-radius: 8px;
	padding: 12px;

	transition: all 150ms ease;
}

.general_icon {
	fill: var(--txt-secondary);
}

.general_icon.success {
	fill: var(--green);
}

.general_icon.warning {
	fill: var(--yellow);
}

.general_icon.error {
	fill: var(--red);
}

.description {
	font-size: 12px;
	font-weight: 600;
	line-height: 18px;
	color: var(--txt-tertiary);

	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
	overflow: hidden;

	max-width: 250px;

	margin-top: 6px;
}

.badges {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-top: 12px;
}

.badge {
	display: flex;
	align-items: center;
	gap: 6px;

	height: 28px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	fill: var(--txt-tertiary);

	padding: 0 8px;
}

.badge .secondary {
	color: var(--txt-secondary);
}

.badge .tertiary {
	color: var(--txt-tertiary);
}

.actions {
	margin-top: 12px;
}

.action {
	cursor: pointer;
	padding: 4px 8px 4px 6px;
	border-radius: 4px;
	background: var(--op-5);
	border: 1px solid var(--op-5);

	transition: all 0.2s var(--bezier);
}

.action:hover {
	background: var(--op-10);
}

.action:active {
	background: var(--op-5);
}

.close_icon {
	transition: all 0.2s ease;

	width: 14px;
	height: 14px;
	position: absolute;
	right: 8px;
	top: 8px;
	fill: var(--txt-secondary);
	padding: 4px;
	box-sizing: content-box;
	border-radius: 50%;
	cursor: pointer;
	opacity: 0;

	transition: all 0.2s ease;
}

.notification:hover .close_icon {
	opacity: 0.5;
}

.notification .close_icon:hover {
	opacity: 1;
}

@media (max-width: 500px) {
	.notification {
		width: calc(100vw - 32px - 32px);
	}

	.close_icon {
		opacity: 1;
	}
}
</style>
