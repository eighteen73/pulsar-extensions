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
	stickyOffset: {
		type: 'string',
	},
	stickyZIndex: {
		type: 'number',
	},
	stickyOnScrollUp: {
		type: 'boolean',
	},
	unstickOnMobile: {
		type: 'boolean',
	},
	unstickBreakpoint: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit(props) {
	const { attributes, setAttributes } = props;
	const {
		stickyOffset,
		stickyZIndex,
		stickyOnScrollUp,
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
								label={__('Top offset', 'pulsar-extensions')}
								help={__(
									'Distance from the top edge when stuck to the viewport',
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
									'Hide on scroll down',
									'pulsar-extensions'
								)}
								help={__(
									'Hide sticky element when scrolling down, show when scrolling up.',
									'pulsar-extensions'
								)}
								checked={stickyOnScrollUp || false}
								onChange={(value) =>
									setAttributes({
										stickyOnScrollUp: value,
									})
								}
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
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {
	const {
		stickyOnScrollUp,
		stickyOffset,
		unstickOnMobile,
		unstickBreakpoint,
		style,
	} = attributes;

	const isSticky = style?.position?.type === 'sticky';

	return clsx({
		['is-sticky-hidden-on-scroll-down']: stickyOnScrollUp && isSticky,
		[`is-sticky-offset-${stickyOffset}`]: stickyOffset && isSticky,
		['is-unstuck-on-mobile']: unstickOnMobile && isSticky,
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
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateInlineStyles(attributes) {
	const { stickyZIndex } = attributes;
	return {
		zIndex: stickyZIndex,
	};
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/sticky',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	inlineStyleGenerator: generateInlineStyles,
	Edit: BlockEdit,
	order: 'after',
});
