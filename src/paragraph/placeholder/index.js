/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { paragraph } from '@wordpress/icons';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';

/**
 * Placeholder copy for headings.
 *
 * @type {string}
 */
const HEADING_PLACEHOLDER = 'Lorem ipsum dolor sit amet';

/**
 * Placeholder copy for paragraphs.
 *
 * @type {string}
 */
const PARAGRAPH_PLACEHOLDER =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

/**
 * PlaceholderEdit
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.name          Block name.
 * @param {Function} props.setAttributes Attribute setter provided by Gutenberg.
 * @return {JSX.Element} Toolbar control for inserting placeholder text.
 */
function PlaceholderEdit({ name, setAttributes }) {
	const content =
		name === 'core/heading' ? HEADING_PLACEHOLDER : PARAGRAPH_PLACEHOLDER;

	return (
		<BlockControls group="other">
			<ToolbarGroup>
				<ToolbarButton
					icon={paragraph}
					label={__('Insert placeholder text', 'pulsar-extensions')}
					onClick={() => setAttributes({ content })}
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}

registerBlockExtension(['core/paragraph', 'core/heading'], {
	extensionName: 'pulsar-extensions/placeholder',
	classNameGenerator: () => null,
	Edit: PlaceholderEdit,
	order: 'after',
});
