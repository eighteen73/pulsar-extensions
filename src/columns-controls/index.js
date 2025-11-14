/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import BreakpointSelectionControl from '../components/breakpoint-selection-control';
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	isReversedOnMobile: {
		type: 'boolean',
	},
	stackBreakpoint: {
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
	const { isReversedOnMobile, isStackedOnMobile, stackBreakpoint } =
		attributes;

	return (
		<InspectorControls group="settings">
			{isStackedOnMobile && (
				<PanelBody className="pulsar-extensions-columns-controls-panel-body">
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

					<BreakpointSelectionControl
						label={__('Stack breakpoint', 'pulsar-extensions')}
						value={stackBreakpoint || 'md'}
						onChange={(value) =>
							setAttributes({ stackBreakpoint: value })
						}
					/>
				</PanelBody>
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
	const { isStackedOnMobile, isReversedOnMobile, stackBreakpoint } =
		attributes;

	return clsx({
		'is-reversed-on-mobile': isReversedOnMobile,
		[`is-stacked-on-${stackBreakpoint}`]:
			isStackedOnMobile && !!stackBreakpoint,
	});
}

registerBlockExtension(['core/columns'], {
	extensionName: 'pulsar-extensions/columns-controls',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
