/**
 * WordPress dependencies
 */
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { Dropdown, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { pullLeft, pullRight, siteLogo, trash } from '@wordpress/icons';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import {
	Icon,
	IconPicker,
} from '@10up/block-components/components/icon-picker';
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
 * 		name: 'pulsar-extensions/arrow-right',
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
 * @param {Object}   props               Component props.
 * @param {string}   props.clientId      Block client identifier.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Setter for block attributes.
 * @return {JSX.Element} Inspector controls for selecting and configuring icons.
 */
function BlockEdit({ clientId, attributes, setAttributes }) {
	const { icon } = attributes;
	// Destructure icon properties with defaults
	const { position = 'after', color, name } = icon || {};

	/**
	 * Extract namespace and icon name from namespaced icon name.
	 *
	 * @param {string} namespacedName Namespaced icon name (e.g., 'pulsar-extensions/arrow-right').
	 * @return {{namespace: string, iconName: string}|null} Extracted namespace and icon name.
	 */
	const parseIconName = (namespacedName) => {
		if (!namespacedName || typeof namespacedName !== 'string') {
			return null;
		}

		const parts = namespacedName.split('/');
		if (parts.length !== 2) {
			return null;
		}

		return {
			namespace: parts[0],
			iconName: parts[1],
		};
	};

	/**
	 * Build namespaced icon name from namespace and icon name.
	 *
	 * @param {string} namespace Icon namespace (e.g., 'pulsar-extensions').
	 * @param {string} iconName  Icon name (e.g., 'arrow-right').
	 * @return {string} Namespaced icon name.
	 */
	const buildIconName = (namespace, iconName) => {
		if (!namespace || !iconName) {
			return null;
		}
		return `${namespace}/${iconName}`;
	};

	/**
	 * Helper to update icon attributes while preserving existing values
	 *
	 * @param {Object} newAttributes New attributes to merge into the icon object
	 */
	const updateIcon = (newAttributes) => {
		const updatedIcon = { ...icon, ...newAttributes };

		// If selecting an icon for the first time and no position is set, default to 'after'
		if (newAttributes.name && !updatedIcon.position) {
			updatedIcon.position = 'after';
		}

		setAttributes({ icon: updatedIcon });
	};

	/**
	 * Helper to remove icon
	 */
	const removeIcon = () => {
		setAttributes({ icon: null });
	};

	// Parse namespaced icon name for IconPicker
	const iconParts = parseIconName(name);
	const iconPickerValue = iconParts
		? { name: iconParts.iconName, iconSet: iconParts.namespace }
		: { name: null, iconSet: null };

	const buttonIcon =
		iconPickerValue?.name && iconPickerValue?.iconSet ? (
			<Icon
				name={iconPickerValue?.name}
				iconSet={iconPickerValue?.iconSet}
			/>
		) : null;

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<Dropdown
						popoverProps={{ placement: 'bottom-start' }}
						renderToggle={({ isOpen, onToggle }) => (
							<ToolbarButton
								onClick={onToggle}
								aria-expanded={isOpen}
								icon={icon ? buttonIcon : siteLogo}
								label={
									icon
										? __('Change Icon', 'pulsar-extensions')
										: __('Add Icon', 'pulsar-extensions')
								}
							/>
						)}
						renderContent={() => (
							<IconPicker
								value={iconPickerValue.name}
								onChange={(value) => {
									const { iconSet, name: iconName } = value;
									const namespacedName = buildIconName(
										iconSet,
										iconName
									);
									updateIcon({ name: namespacedName });
								}}
							/>
						)}
					/>

					{icon && (
						<>
							<ToolbarButton
								onClick={() => {
									removeIcon();
								}}
								icon={trash}
								label={__('Remove Icon', 'pulsar-extensions')}
							/>

							<ToolbarButton
								onClick={() => {
									updateIcon({ position: 'before' });
								}}
								icon={pullLeft}
								label={__(
									'Show Icon Before Text',
									'pulsar-extensions'
								)}
								isActive={position === 'before'}
							/>

							<ToolbarButton
								onClick={() => {
									updateIcon({ position: 'after' });
								}}
								icon={pullRight}
								label={__(
									'Show Icon After Text',
									'pulsar-extensions'
								)}
								isActive={position === 'after'}
							/>
						</>
					)}
				</ToolbarGroup>
			</BlockControls>

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
 * @param {Object} attributes Block attributes.
 * @return {string} Generated class names describing the icon configuration.
 */
function generateClassNames(attributes) {
	const { icon } = attributes;
	const { name, position, color } = icon || {};

	// Check if we actually have an icon selected
	const hasIcon = Boolean(name);
	const isAfter = position === 'after';

	// Parse namespaced icon name to generate CSS class
	// e.g., 'pulsar-extensions/arrow-right' -> 'has-icon-pulsar-extensions-arrow-right'
	let iconClass = null;
	if (hasIcon && typeof name === 'string') {
		// Replace slashes with hyphens for CSS class name
		const classSlug = name.replace(/\//g, '-');
		iconClass = `has-icon-${classSlug}`;
	}

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
 * @param {Object} attributes Block attributes.
 * @return {Object<string, string>|null} Inline CSS variables for icon styling or null.
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
