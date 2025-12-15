/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
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
	isStackedOnMobile: {
		type: 'boolean',
	},
	stackedBreakpoint: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {Object} props block props
 * @return {JSX.Element} inspector controls for configuring row stacking
 */
function BlockEdit(props) {
	const { attributes, setAttributes } = props;
	const { isStackedOnMobile, stackedBreakpoint, layout } = attributes;

	const isRowLayout =
		layout?.type === 'flex' && layout?.orientation !== 'vertical';
	const isFlexWrapEnabled = layout?.flexWrap === 'wrap';

	return (
		<>
			{isRowLayout && (
				<InspectorControls group="settings">
					<div style={{ padding: '0 16px 8px' }}>
						<ToggleControl
							label={__(
								'Stack row on mobile',
								'pulsar-extensions'
							)}
							help={
								isFlexWrapEnabled
									? __(
											'Disabled when "Allow to wrap to multiple lines" is enabled',
											'pulsar-extensions'
										)
									: __(
											'More predictable control over when the row stacks',
											'pulsar-extensions'
										)
							}
							checked={isStackedOnMobile || false}
							disabled={isFlexWrapEnabled}
							onChange={() => {
								const newValue = !isStackedOnMobile;
								setAttributes({
									isStackedOnMobile: newValue,
									// Assign default breakpoint if toggled on and none exists
									stackedBreakpoint:
										newValue && !stackedBreakpoint
											? 'md'
											: stackedBreakpoint,
								});
							}}
						/>

						{isStackedOnMobile && !isFlexWrapEnabled && (
							<BreakpointSelectionControl
								label={__(
									'Stacked breakpoint',
									'pulsar-extensions'
								)}
								value={stackedBreakpoint || 'md'}
								onChange={(value) =>
									setAttributes({ stackedBreakpoint: value })
								}
							/>
						)}
					</div>
				</InspectorControls>
			)}
		</>
	);
}

/**
 * generateClassNames
 *
 * @param {Object} attributes block attributes
 * @return {string} generated class names
 */
function generateClassNames(attributes) {
	const { isStackedOnMobile, stackedBreakpoint, layout } = attributes;
	const isFlexWrapEnabled = layout?.flexWrap === 'wrap';

	return clsx({
		'is-stacked-on-mobile': isStackedOnMobile && !isFlexWrapEnabled,
		[`is-stacked-on-${stackedBreakpoint}`]:
			isStackedOnMobile && !!stackedBreakpoint && !isFlexWrapEnabled,
	});
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/row',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
