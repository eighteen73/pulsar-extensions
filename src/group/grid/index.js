import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import GridColumnsControl from '../../components/grid-columns-control';
import BreakpointSelectionControl from '../../components/breakpoint-selection-control';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import { Repeater } from '@10up/block-components/components/repeater';
import clsx from 'clsx';

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

	return (
		<>
			{isGridLayout && (
				<InspectorControls group="settings">
					<PanelBody
						title={__('Responsive layout', 'pulsar-extensions')}
						initialOpen={false}
					>
						<Repeater
							value={responsiveColumns}
							onChange={(newValue) => {
								setAttributes({ responsiveColumns: newValue });
							}}
							addButtonLabel={__(
								'Add Breakpoint',
								'pulsar-extensions'
							)}
							defaultRowValues={{
								breakpoint: 'lg',
								columnCount: 3,
							}}
							minRows={0}
							maxRows={5}
						>
							{(value, index, onChange) => (
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
											'Breakpoint',
											'pulsar-extensions'
										)}
										breakpoints={['xs', 'sm', 'md', 'lg']}
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
	const { responsiveColumns = [] } = attributes;

	// Build an object of classes from the responsiveColumns array
	const classObject = {};

	responsiveColumns.forEach((item) => {
		if (item?.breakpoint && item?.columnCount) {
			classObject[`grid-columns-${item.breakpoint}-${item.columnCount}`] =
				true;
		}
	});

	return clsx(classObject);
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/grid',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
