/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';

/**
 * Internal dependencies
 */
import PlaceholderControl from '../../components/placeholder-control';

/**
 * PlaceholderEdit
 *
 * @param {Object}   props               Component props.
 * @param {Function} props.setAttributes Attribute setter provided by Gutenberg.
 * @return {JSX.Element} Toolbar control for inserting placeholder text.
 */
function PlaceholderEdit({ setAttributes }) {
	return (
		<PlaceholderControl
			placeholderType="paragraph"
			attribute="content"
			setAttributes={setAttributes}
		/>
	);
}

registerBlockExtension('core/paragraph', {
	extensionName: 'pulsar-extensions/paragraph/placeholder',
	classNameGenerator: () => null,
	Edit: PlaceholderEdit,
	order: 'after',
});
