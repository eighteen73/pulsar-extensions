/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import breakpoints from '../constants/breakpoints';

const BreakpointSelectionControl = ({
	value,
	label = __('Screen sizes up to', 'pulsar-extensions'),
	onChange,
	disabledBreakpoints = [],
}) => {
	const breakpointKeys = Object.keys(breakpoints);
	const activeValue = value ?? breakpointKeys[0];

	const handleChange = (selectedValue) => {
		if (typeof onChange === 'function') {
			onChange(selectedValue);
		}
	};

	return (
		<ToggleGroupControl
			label={label}
			onChange={handleChange}
			value={activeValue}
			isBlock
			help={breakpoints[activeValue]?.help}
		>
			{breakpointKeys.map((key) => (
				<ToggleGroupControlOption
					key={key}
					value={key}
					label={breakpoints[key].label}
					disabled={
						disabledBreakpoints.includes(key) && key !== activeValue
					}
				/>
			))}
		</ToggleGroupControl>
	);
};

export default BreakpointSelectionControl;
