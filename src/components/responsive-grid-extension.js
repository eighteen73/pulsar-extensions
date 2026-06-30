/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { Repeater } from '@10up/block-components/components/repeater';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import breakpoints from '../constants/breakpoints';
import GridColumnsControl from './grid-columns-control';
import BreakpointSelectionControl from './breakpoint-selection-control';

const defaultColumnCount = 3;

export const responsiveColumnsAttributes = {
	responsiveColumns: {
		type: 'array',
		default: [],
	},
};

export function ResponsiveGridEdit(props) {
	const { attributes, setAttributes } = props;
	const { layout, responsiveColumns = [] } = attributes;

	const isGridLayout = layout?.type === 'grid';
	const isManualMode = layout?.minimumColumnWidth === null;
	const allBreakpoints = Object.keys(breakpoints);

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

	if (!(isGridLayout && isManualMode)) {
		return null;
	}

	return (
		<InspectorControls group="settings">
			<PanelBody
				title={__('Mobile layout', 'pulsar-extensions')}
				initialOpen={false}
			>
				<Repeater
					value={responsiveColumns}
					onChange={(newValue) => {
						// Ensure each row has values, pick a non-duplicate default breakpoint.
						const usedBreakpoints = newValue
							.map((row) => row.breakpoint)
							.filter(Boolean);

						const mergedValues = newValue.map((row) => {
							let breakpoint = row.breakpoint;

							if (!breakpoint) {
								const available = allBreakpoints.filter(
									(bp) => !usedBreakpoints.includes(bp)
								);
								breakpoint =
									available[available.length - 1] ||
									allBreakpoints[allBreakpoints.length - 1];
								usedBreakpoints.push(breakpoint);
							}

							return {
								...row,
								breakpoint,
								columnCount:
									row.columnCount ?? defaultColumnCount,
							};
						});

						setAttributes({
							responsiveColumns: mergedValues,
						});
					}}
					addButton={AddBreakpointButton}
				>
					{(value, index, onChange, removeItem) => (
						<div key={index} style={{ marginBottom: '16px' }}>
							<BreakpointSelectionControl
								value={value?.breakpoint ?? 'lg'}
								onChange={(newBreakpoint) =>
									onChange({
										...value,
										breakpoint: newBreakpoint,
									})
								}
								label={__('Screen size', 'pulsar-extensions')}
								breakpoints={allBreakpoints}
								disabledBreakpoints={responsiveColumns
									.map((row) => row.breakpoint)
									.filter((bp) => bp !== value.breakpoint)}
							/>

							<GridColumnsControl
								value={value?.columnCount ?? defaultColumnCount}
								onChange={(newColumnCount) =>
									onChange({
										...value,
										columnCount: newColumnCount,
									})
								}
								label={__('Columns', 'pulsar-extensions')}
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
	);
}

export function generateResponsiveGridClasses(attributes) {
	const { layout, responsiveColumns = [] } = attributes;

	const isGridLayout = layout?.type === 'grid';
	const isManualMode = layout?.minimumColumnWidth === null;

	if (!(isGridLayout && isManualMode)) {
		return '';
	}

	const classObject = {};

	responsiveColumns.forEach((item) => {
		if (item?.breakpoint && item?.columnCount) {
			classObject[`is-responsive-columns-on-${item.breakpoint}`] = true;
		}
	});

	return clsx(classObject);
}

export function generateResponsiveGridInlineStyles(attributes) {
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
