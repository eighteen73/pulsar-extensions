/**
 * WordPress dependencies
 */
import { InspectorControls, useSettings } from '@wordpress/block-editor';
import {
	ToggleControl,
	CustomSelectControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import BreakpointSelectionControl from '../../components/breakpoint-selection-control';
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	stickyPosition: {
		type: 'string',
		default: 'top',
	},
	stickyOffset: {
		type: 'string',
		default: '0',
	},
	stickyZIndex: {
		type: 'number',
	},
	unstickOnMobile: {
		type: 'boolean',
	},
	unstickBreakpoint: {
		type: 'string',
	},
};

const stickyPositionOptions = [
	{
		key: 'top',
		name: __('Top', 'pulsar-extensions'),
	},
	{
		key: 'bottom',
		name: __('Bottom', 'pulsar-extensions'),
	},
];

/**
 * Derive the sticky offset CSS value for the custom property.
 *
 * @param {string | null | undefined} stickyOffset Selected offset slug.
 * @return {string | null} Sticky offset CSS value.
 */
const getStickyOffsetValue = (stickyOffset) => {
	if (!stickyOffset && stickyOffset !== '0') {
		return null;
	}

	if (stickyOffset === '0') {
		return '0px';
	}

	return `var(--wp--preset--spacing--${stickyOffset})`;
};

/**
 * BlockEdit
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter provided by Gutenberg.
 * @return {JSX.Element|null} Inspector controls for sticky behavior or null if not sticky.
 */
function BlockEdit(props) {
	const { attributes, setAttributes } = props;
	const {
		stickyPosition,
		stickyOffset,
		stickyZIndex,
		unstickOnMobile,
		unstickBreakpoint,
	} = attributes;

	const spacingPresetsRaw = useSettings([
		'spacing',
		'spacingSizes',
		'theme',
	]) || [[]];
	const spacingPresets = spacingPresetsRaw[0];

	const spacingOptions = [
		{ key: '0', name: __('None', 'pulsar-extensions') },
		...spacingPresets.map((preset) => ({
			key: preset.slug,
			name: preset.name || preset.slug.toUpperCase(),
		})),
	];

	return (
		<>
			{attributes?.style?.position?.type === 'sticky' && (
				<InspectorControls group="position">
					<div style={{ paddingTop: '16px' }}>
						<VStack spacing={4}>
							<CustomSelectControl
								label={__('Position', 'pulsar-extensions')}
								value={stickyPositionOptions.find(
									(option) =>
										option.key === (stickyPosition || 'top')
								)}
								onChange={({ selectedItem }) => {
									setAttributes({
										stickyPosition:
											selectedItem?.key || 'top',
									});
								}}
								options={stickyPositionOptions}
							/>
							<CustomSelectControl
								label={__('Sticky offset', 'pulsar-extensions')}
								help={__(
									'Distance from the viewport edge when the block is stuck.',
									'pulsar-extensions'
								)}
								value={spacingOptions.find(
									(option) =>
										option.key === (stickyOffset || '0')
								)}
								onChange={({ selectedItem }) => {
									setAttributes({
										stickyOffset: selectedItem?.key || null,
									});
								}}
								options={spacingOptions}
							/>
							<NumberControl
								label={__(
									'Z-Index position',
									'pulsar-extensions'
								)}
								help={__(
									'Control stacking order. Higher values appear on top.',
									'pulsar-extensions'
								)}
								value={stickyZIndex ?? 0}
								onChange={(value) => {
									// Convert to number and set to null if 0
									const numValue =
										value === '' || value === undefined
											? 0
											: Number(value);
									setAttributes({
										stickyZIndex:
											numValue === 0 ? null : numValue,
									});
								}}
								step={1}
							/>
							<ToggleControl
								label={__(
									'Unstick on mobile',
									'pulsar-extensions'
								)}
								help={__(
									'Disable sticky positioning on mobile devices',
									'pulsar-extensions'
								)}
								checked={unstickOnMobile || false}
								onChange={(value) => {
									if (value && !unstickBreakpoint) {
										setAttributes({
											unstickOnMobile: true,
											unstickBreakpoint: 'lg',
										});
									} else {
										setAttributes({
											unstickOnMobile: value,
										});
									}
								}}
							/>

							{unstickOnMobile && (
								<BreakpointSelectionControl
									label={__(
										'Unstick breakpoint',
										'pulsar-extensions'
									)}
									value={unstickBreakpoint || 'lg'}
									onChange={(value) => {
										setAttributes({
											unstickBreakpoint: value,
										});
									}}
								/>
							)}
						</VStack>
					</div>
				</InspectorControls>
			)}
		</>
	);
}

/**
 * generateClassNames
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Generated class list describing sticky state variations.
 */
function generateClassNames(attributes) {
	const {
		stickyPosition,
		stickyOffset,
		unstickOnMobile,
		unstickBreakpoint,
		style,
	} = attributes;

	const isSticky = style?.position?.type === 'sticky';

	return clsx({
		[`is-position-sticky-${stickyPosition}`]: stickyPosition && isSticky,
		[`is-sticky-offset-${stickyOffset}`]: stickyOffset && isSticky,
		'is-unstuck-on-mobile': unstickOnMobile && isSticky,
		[`is-unstuck-on-${unstickBreakpoint}`]:
			unstickOnMobile && !!unstickBreakpoint && isSticky,
	});
}

/**
 * generateInlineStyles
 *
 * a function to generate the new inline styles object that should get added to
 * the wrapping element of the block.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object<string, string|number>} Inline styles required for sticky positioning.
 */
function generateInlineStyles(attributes) {
	const { stickyZIndex, stickyOffset, style } = attributes;
	const inlineStyles = {};
	const isSticky = style?.position?.type === 'sticky';

	if (typeof stickyZIndex === 'number') {
		inlineStyles.zIndex = stickyZIndex;
	}

	if (isSticky) {
		const stickyOffsetValue = getStickyOffsetValue(stickyOffset);

		if (stickyOffsetValue !== null) {
			inlineStyles['--sticky-offset'] = stickyOffsetValue;
		}
	}

	return inlineStyles;
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/sticky',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	inlineStyleGenerator: generateInlineStyles,
	Edit: BlockEdit,
	order: 'after',
});
