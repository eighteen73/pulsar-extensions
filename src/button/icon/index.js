/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import { IconPicker } from '@10up/block-components/components/icon-picker';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	icon: {
		type: 'object',
	},
	iconPosition: {
		type: 'enum',
		enum: ['before', 'after'],
	},
	iconColor: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit({ clientId, attributes, setAttributes }) {
	const { icon, iconPosition, iconColor } = attributes;

	return (
		<InspectorControls group="settings">
			<PanelBody title={__('Icon', 'pulsar-extensions')}>
				<IconPicker
					value={icon}
					onChange={(value) => setAttributes({ icon: value })}
					iconSet="material-design"
				/>
			</PanelBody>
		</InspectorControls>
	);
}

/**
 * generateClassNames
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {
	const { icon, iconPosition, iconColor } = attributes;
	const hasIcon = Boolean(icon);
	const isAfter = iconPosition === 'after';
	const iconClass =
		icon?.iconSet && icon?.name
			? `has-icon-${icon.iconSet}-${icon.name}`
			: null;

	return clsx({
		'has-icon': hasIcon,
		'has-icon-before': hasIcon && !isAfter,
		'has-icon-after': hasIcon && isAfter,
		[`has-icon-color-${iconColor}`]: iconColor,
		[iconClass]: Boolean(iconClass),
	});
}

registerBlockExtension('core/button', {
	extensionName: 'pulsar-extensions/button/icon',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
