/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { language } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Strings } from '../constants/strings';

/**
 * Toolbar control for inserting placeholder text.
 *
 * @param {Object}   props                   Component props.
 * @param {string}   props.placeholderType   Key in Strings.placeholders.
 * @param {string}   props.customPlaceholder Custom placeholder text.
 * @param {string}   props.attribute         Block attribute to populate.
 * @param {Function} props.setAttributes     Attribute setter provided by Gutenberg.
 * @return {JSX.Element|null} Toolbar control or null when unavailable.
 */
export default function PlaceholderControl({
	placeholderType,
	customPlaceholder,
	attribute,
	setAttributes,
}) {
	const content = customPlaceholder || Strings.placeholders[placeholderType];

	if (!content) {
		return null;
	}

	return (
		<BlockControls group="other">
			<ToolbarGroup>
				<ToolbarButton
					icon={language}
					label={__('Insert placeholder text', 'pulsar-extensions')}
					onClick={() => setAttributes({ [attribute]: content })}
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}
