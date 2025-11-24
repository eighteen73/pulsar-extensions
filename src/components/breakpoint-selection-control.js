import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DEFAULT_BREAKPOINTS = ['sm', 'md', 'lg', 'xl'];

const DEFAULT_HELP_TEXT = {
	sm: __('Mobile screens.', 'pulsar-extensions'),
	md: __('Landscape mobiles and below.', 'pulsar-extensions'),
	lg: __('Tablets in portrait mode and below.', 'pulsar-extensions'),
	xl: __(
		'Smaller laptops or tablets in landscape mode and below.',
		'pulsar-extensions'
	),
};

const BreakpointSelectionControl = ({
	value,
	label = __('Screen sizes up to', 'pulsar-extensions'),
	onChange,
	breakpoints = DEFAULT_BREAKPOINTS,
	helpTextMap = DEFAULT_HELP_TEXT,
	disabledBreakpoints = [],
}) => {
	const activeValue = value ?? breakpoints[0];

	const getHelpText = (key) => helpTextMap[key] || '';

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
			help={getHelpText(activeValue)}
		>
			{breakpoints.map((breakpoint) => (
				<ToggleGroupControlOption
					key={breakpoint}
					value={breakpoint}
					label={breakpoint.toUpperCase()}
					disabled={
						disabledBreakpoints.includes(breakpoint) &&
						breakpoint !== activeValue
					}
				/>
			))}
		</ToggleGroupControl>
	);
};

export default BreakpointSelectionControl;
