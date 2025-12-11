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
	isReversedOnMobile: {
		type: 'boolean',
	},
	stackedBreakpoint: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit({ attributes, setAttributes }) {
	const { isReversedOnMobile, isStackedOnMobile, stackedBreakpoint } =
		attributes;

	return (
		<InspectorControls group="settings">
			{isStackedOnMobile && (
				<div style={{ padding: '0 16px 16px' }}>
					<BreakpointSelectionControl
						label={__('Stacked breakpoint', 'pulsar-extensions')}
						value={stackedBreakpoint || 'md'}
						onChange={(value) =>
							setAttributes({ stackedBreakpoint: value })
						}
					/>

					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Reverse direction when stacked',
							'pulsar-extensions'
						)}
						checked={isReversedOnMobile || false}
						onChange={() =>
							setAttributes({
								isReversedOnMobile: !isReversedOnMobile,
							})
						}
					/>
				</div>
			)}
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
	const { isStackedOnMobile, isReversedOnMobile, stackedBreakpoint } =
		attributes;

	return clsx({
		'is-reversed-when-stacked': isReversedOnMobile,
		[`is-stacked-on-${stackedBreakpoint}`]:
			isStackedOnMobile && !!stackedBreakpoint,
	});
}

registerBlockExtension('core/columns', {
	extensionName: 'pulsar-extensions/columns/stacked',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
