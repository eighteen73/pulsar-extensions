/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
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
import ColorControl from '../../components/color-control';
import './editor.scss';
import './style.scss';

/**
 * additional block attributes object
 * @example
 * {
 * 	icon: {
 * 		position: 'after',
 * 		color: 'blue',
 * 		name: 'star',
 * 		set: 'default',
 * 	}
 * }
 */
const additionalAttributes = {
	icon: {
		type: 'object',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit({ clientId, attributes, setAttributes }) {
	const { icon } = attributes;
	// Destructure icon properties with defaults
	const { position = 'after', color, name, set } = icon || {};

	/**
	 * Helper to update icon attributes while preserving existing values
	 *
	 * @param {object} newAttributes New attributes to merge into the icon object
	 */
	const updateIcon = (newAttributes) => {
		const updatedIcon = { ...icon, ...newAttributes };

		// If selecting an icon for the first time and no position is set, default to 'after'
		if (newAttributes.name && !updatedIcon.position) {
			updatedIcon.position = 'after';
		}

		setAttributes({ icon: updatedIcon });
	};

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title={__('Icon', 'pulsar-extensions')}>
					<IconPicker
						className="pulsar-extensions-icon-picker"
						value={{ name, iconSet: set }}
						onChange={(value) => {
							const { iconSet, ...rest } = value;
							updateIcon({ ...rest, set: iconSet });
						}}
					/>

					<ToggleGroupControl
						label={__('Icon position', 'pulsar-extensions')}
						value={position}
						onChange={(value) => updateIcon({ position: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="before"
							label={__('Before', 'pulsar-extensions')}
						/>
						<ToggleGroupControlOption
							value="after"
							label={__('After', 'pulsar-extensions')}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="color">
				<ColorControl
					label={__('Icon', 'pulsar-extensions')}
					value={color}
					onChange={(value, slug) => updateIcon({ color: slug })}
					panelId={clientId}
				/>
			</InspectorControls>
		</>
	);
}

/**
 * generateClassNames
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {
	const { icon } = attributes;
	const { name, set, position, color } = icon || {};

	// Check if we actually have an icon selected
	const hasIcon = Boolean(name && set);
	const isAfter = position === 'after';
	const iconClass = hasIcon ? `has-icon-${set}-${name}` : null;

	return clsx({
		'has-icon': hasIcon,
		'has-icon-before': hasIcon && !isAfter,
		'has-icon-after': hasIcon && isAfter,
		'has-icon-color': color,
		[iconClass]: Boolean(iconClass),
	});
}

/**
 * generateInlineStyles
 *
 * a function to generate the new inline styles object that should get added to
 * the wrapping element of the block.
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateInlineStyles(attributes) {
	const { icon } = attributes;
	const { color } = icon || {};

	return color
		? { '--icon-color': `var(--wp--preset--color--${color})` }
		: null;
}

registerBlockExtension('core/button', {
	extensionName: 'pulsar-extensions/button/icon',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	inlineStyleGenerator: generateInlineStyles,
	Edit: BlockEdit,
	order: 'after',
});
