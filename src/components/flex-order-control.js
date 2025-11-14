import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FlexOrderControl = ({
	value,
	itemCount = 3,
	label = __('Order on mobile', 'pulsar-extensions'),
	helpText = __(
		'Choose the display order for this column on mobile devices.',
		'pulsar-extensions'
	),
	onChange,
}) => {
	const normalizedItemCount = Math.max(1, Number(itemCount) || 1);
	const activeValue = value ?? 1;

	const handleChange = (selectedValue) => {
		if (typeof onChange === 'function') {
			onChange(Number(selectedValue));
		}
	};

	return (
		<ToggleGroupControl
			label={label}
			onChange={handleChange}
			value={activeValue}
			isBlock
			help={helpText}
		>
			{Array.from({ length: normalizedItemCount }, (_unused, index) => {
				const optionValue = index + 1;

				return (
					<ToggleGroupControlOption
						key={optionValue}
						value={optionValue}
						label={optionValue.toString()}
					/>
				);
			})}
		</ToggleGroupControl>
	);
};

export default FlexOrderControl;
