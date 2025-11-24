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
		<>
			<InspectorControls group="settings">
				<PanelBody title={__('Icon', 'pulsar-extensions')}>
					<IconPicker
						className="pulsar-extensions-icon-picker"
						value={icon}
						onChange={(value) =>
							setAttributes({
								icon: value,
								iconPosition: !iconPosition
									? 'after'
									: iconPosition,
							})
						}
						iconSet="material-design"
					/>

					<ToggleGroupControl
						label={__('Icon position', 'pulsar-extensions')}
						value={iconPosition || 'after'}
						onChange={(value) =>
							setAttributes({ iconPosition: value })
						}
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
					value={iconColor}
					onChange={(value, slug) =>
						setAttributes({ iconColor: slug })
					}
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
		'has-icon-color': iconColor,
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
	const { iconColor } = attributes;
	return iconColor
		? { '--icon-color': `var(--wp--preset--color--${iconColor})` }
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
