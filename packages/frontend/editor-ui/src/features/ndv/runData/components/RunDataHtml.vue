<script lang="ts">
import xss, { safeAttrValue, whiteList, type IWhiteList } from 'xss';

const sanitizeWhiteList: IWhiteList = {
	...whiteList,
	style: [],
	img: [...(whiteList.img ?? []), 'src'],
	title: [],
};

const serializeAttr = (tag: string, name: string, value: string) => {
	const safe = safeAttrValue(tag, name, value, {
		process: (input) => input,
	});

	return safe ? `${name}="${safe}"` : '';
};

const sanitizeHtml = (inputHtml: string) =>
	xss(inputHtml, {
		whiteList: sanitizeWhiteList,
		onIgnoreTag(tag) {
			if (tag === 'head') {
				return '';
			}

			return;
		},
		onIgnoreTagAttr(tag, name, value) {
			if (name === 'class' || name === 'style') {
				return serializeAttr(tag, name, value);
			}

			return;
		},
	});

export default {
	name: 'RunDataHtml',
	props: {
		inputHtml: {
			type: String,
			required: true,
		},
	},
	computed: {
		sanitizedHtml() {
			return sanitizeHtml(this.inputHtml);
		},
	},
};
</script>

<template>
	<iframe class="__html-display" :srcdoc="sanitizedHtml" />
</template>

<style lang="scss">
.__html-display {
	width: 100%;
	height: 100%;
}
</style>
