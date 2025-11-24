import { __ } from '@wordpress/i18n';

const breakpoints = {
	sm: {
		label: 'SM',
		help: __('Mobile screens.', 'pulsar-extensions'),
	},
	md: {
		label: 'MD',
		help: __('Landscape mobiles and below.', 'pulsar-extensions'),
	},
	lg: {
		label: 'LG',
		help: __('Tablets in portrait mode and below.', 'pulsar-extensions'),
	},
	xl: {
		label: 'XL',
		help: __(
			'Smaller laptops or tablets in landscape mode and below.',
			'pulsar-extensions'
		),
	},
};

export default breakpoints;
