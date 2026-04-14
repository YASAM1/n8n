import xss, { escapeAttrValue, whiteList, type IWhiteList } from 'xss';
import type { DirectiveBinding, FunctionDirective } from 'vue';

/**
 * Custom directive `n8nHtml` to replace v-html from Vue to sanitize content.
 *
 * Usage:
 * In your Vue template, use the directive `v-n8n-html` passing the unsafe HTML.
 *
 * Example:
 * <p v-n8n-html="'<a href="https://site.com" onclick="alert(1)">link</a>'">
 *
 * Compiles to: <p><a href="https://site.com">link</a></p>
 *
 * Hint: Do not use it on components
 * https://vuejs.org/guide/reusability/custom-directives#usage-on-components
 */

const configuredWhiteList: IWhiteList = {
	...whiteList,
	img: [...(whiteList.img ?? []), 'src'],
	input: ['type', 'id', 'checked'],
	code: ['class'],
	div: ['class'],
};

const configuredSanitize = (html: string) =>
	xss(html, {
		whiteList: configuredWhiteList,
		onIgnoreTagAttr(tag, name, value) {
			if (tag === 'a' && name.startsWith('data-')) {
				return `${name}="${escapeAttrValue(value)}"`;
			}

			return;
		},
	});

export const n8nHtml: FunctionDirective<HTMLElement, string> = (
	el: HTMLElement,
	binding: DirectiveBinding<string>,
) => {
	if (binding.value !== binding.oldValue) {
		el.innerHTML = configuredSanitize(binding.value);
	}
};
