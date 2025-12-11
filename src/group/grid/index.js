/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import { Repeater } from '@10up/block-components/components/repeater';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import breakpoints from '../../constants/breakpoints';
import GridColumnsControl from '../../components/grid-columns-control';
import BreakpointSelectionControl from '../../components/breakpoint-selection-control';
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	responsiveColumns: {
		type: 'array',
		default: [],
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
	const { layout, responsiveColumns = [] } = attributes;

	const isGridLayout = layout?.type === 'grid';
	const isManualMode = layout?.minimumColumnWidth === null;
	const allBreakpoints = Object.keys(breakpoints);
	const defaultColumnCount = 3;

	const AddBreakpointButton = (addItem) => {
		if (responsiveColumns.length >= allBreakpoints.length) {
			return null;
		}

		return (
			<Button variant="primary" onClick={() => addItem()}>
				{__('Add screen size', 'pulsar-extensions')}
			</Button>
		);
	};

	return (
		<>
			{isGridLayout && isManualMode && (
				<InspectorControls group="settings">
					<PanelBody
						title={__('Mobile layout', 'pulsar-extensions')}
						initialOpen={false}
					>
						<Repeater
							value={responsiveColumns}
							onChange={(newValue) => {
								// Ensure each row has values, pick a non-duplicate default breakpoint
								const usedBreakpoints = newValue
									.map((row) => row.breakpoint)
									.filter(Boolean);

								const mergedValues = newValue.map((row) => {
									let breakpoint = row.breakpoint;

									// If no breakpoint, pick the first unused one
									if (!breakpoint) {
										const available = allBreakpoints.filter(
											(bp) =>
												!usedBreakpoints.includes(bp)
										);
										breakpoint =
											available[available.length - 1] ||
											allBreakpoints[
												allBreakpoints.length - 1
											];
										usedBreakpoints.push(breakpoint);
									}

									return {
										...row,
										breakpoint,
										columnCount:
											row.columnCount ??
											defaultColumnCount,
									};
								});

								setAttributes({
									responsiveColumns: mergedValues,
								});
							}}
							addButton={AddBreakpointButton}
						>
							{(value, index, onChange, removeItem) => (
								<div
									key={index}
									style={{ marginBottom: '16px' }}
								>
									<BreakpointSelectionControl
										value={value?.breakpoint ?? 'lg'}
										onChange={(newBreakpoint) =>
											onChange({
												...value,
												breakpoint: newBreakpoint,
											})
										}
										label={__(
											'Screen size',
											'pulsar-extensions'
										)}
										breakpoints={allBreakpoints}
										disabledBreakpoints={responsiveColumns
											.map((row) => row.breakpoint)
											.filter(
												(bp) => bp !== value.breakpoint
											)}
									/>

									<GridColumnsControl
										value={value?.columnCount ?? 3}
										onChange={(newColumnCount) =>
											onChange({
												...value,
												columnCount: newColumnCount,
											})
										}
										label={__(
											'Columns',
											'pulsar-extensions'
										)}
										min={1}
										max={16}
									/>

									<div style={{ marginTop: '16px' }}>
										<Button
											isDestructive
											variant="secondary"
											onClick={removeItem}
										>
											{__(
												'Remove screen size',
												'pulsar-extensions'
											)}
										</Button>
									</div>
								</div>
							)}
						</Repeater>
					</PanelBody>
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
	const { layout, responsiveColumns = [] } = attributes;

	const isGridLayout = layout?.type === 'grid';
	const isManualMode = layout?.minimumColumnWidth === null;

	if (isGridLayout && isManualMode) {
		// Build an object of classes from the responsiveColumns array
		const classObject = {};

		responsiveColumns.forEach((item) => {
			if (item?.breakpoint && item?.columnCount) {
				classObject[`is-responsive-columns-on-${item.breakpoint}`] =
					true;
			}
		});

		return clsx(classObject);
	}
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
	const { responsiveColumns = [] } = attributes;

	const styles = {};

	responsiveColumns.forEach((item) => {
		if (item?.breakpoint && item?.columnCount) {
			styles[`--grid-template-columns-${item.breakpoint}`] =
				`repeat(${item.columnCount}, 1fr)`;
		}
	});

	return styles;
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/grid',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	inlineStyleGenerator: generateInlineStyles,
	Edit: BlockEdit,
	order: 'after',
});
