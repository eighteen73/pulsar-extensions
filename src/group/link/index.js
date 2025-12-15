/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import LinkControl from '../../components/link-control';
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	url: {
		type: 'string',
	},
	linkDestination: {
		type: 'string',
	},
	linkTarget: {
		type: 'string',
	},
	rel: {
		type: 'string',
	},
	linkClass: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter provided by Gutenberg.
 * @return {JSX.Element} Toolbar controls that configure block-level links.
 */
function BlockEdit(props) {
	const { attributes, setAttributes } = props;
	const { url, linkDestination, linkTarget, rel, linkClass } = attributes;

	return (
		<BlockControls group="block">
			<LinkControl
				url={url}
				linkDestination={linkDestination}
				linkTarget={linkTarget}
				rel={rel}
				linkClass={linkClass}
				setAttributes={setAttributes}
			/>
		</BlockControls>
	);
}

/**
 * generateClassNames
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Generated class list for link state styling.
 */
function generateClassNames(attributes) {
	const { url, linkDestination, linkClass } = attributes;

	return clsx({
		'is-linked': !!url || linkDestination === 'post',
		'is-linked-to-post': linkDestination === 'post',
		[linkClass]: !!linkClass,
	});
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/link',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
