/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	Flex,
	FlexItem,
	RangeControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

/**
 * GridColumnsControl
 *
 * A reusable control for setting the number of grid columns.
 * Provides both a number input and a range slider for better UX.
 *
 * @param {Object} props Component props
 * @param {number} props.value Current column count value
 * @param {Function} props.onChange Callback function when value changes
 * @param {string} props.label Label for the control (optional, defaults to "Columns")
 * @param {number} props.min Minimum column count (optional, defaults to 1)
 * @param {number} props.max Maximum column count (optional, defaults to 16)
 * @returns {JSX.Element} The column control component
 */
export default function GridColumnsControl({
	value = 3,
	onChange,
	label = __('Columns', 'pulsar-extensions'),
	min = 1,
	max = 16,
}) {
	const handleChange = (newValue) => {
		// Don't allow unsetting or zero values, default to minimum
		const columnCount =
			newValue === '' || newValue === '0' || newValue === 0
				? min
				: parseInt(newValue, 10);
		onChange(columnCount);
	};

	return (
		<fieldset className="pulsar-grid-columns-control">
			<BaseControl.VisualLabel as="legend">
				{label}
			</BaseControl.VisualLabel>
			<Flex gap={4}>
				<FlexItem isBlock>
					<NumberControl
						size="__unstable-large"
						onChange={handleChange}
						value={value}
						min={min}
						max={max}
						label={label}
						hideLabelFromVision
					/>
				</FlexItem>
				<FlexItem isBlock>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						value={value ?? min}
						onChange={handleChange}
						min={min}
						max={max}
						withInputField={false}
						label={label}
						hideLabelFromVision
					/>
				</FlexItem>
			</Flex>
		</fieldset>
	);
}
