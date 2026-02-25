import { __ } from '@wordpress/i18n';

const breakpoints = {
	xs: {
		label: 'XS',
		help: __('Small mobile screens.', 'pulsar-extensions'),
	},
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
