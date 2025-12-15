/**
 * Register icon sets from the REST API.
 *
 * Fetches icon sets from the Pulsar Extensions REST API and registers them
 * using the 10up block-components registerIcons function.
 */

import { registerIcons } from '@10up/block-components/api/register-icons';
import apiFetch from '@wordpress/api-fetch';

let iconsInitialized = false;

/**
 * Fetch and register all icon sets.
 */
const initializeIcons = async () => {
	if (iconsInitialized) {
		return;
	}

	try {
		const iconSets = await apiFetch({
			path: '/pulsar-extensions/v1/icons',
		});

		if (!Array.isArray(iconSets) || iconSets.length === 0) {
			return;
		}

		// Register each icon set.
		iconSets.forEach((iconSet) => {
			if (iconSet.name && Array.isArray(iconSet.icons)) {
				registerIcons(iconSet);
			}
		});

		iconsInitialized = true;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Pulsar Extensions: Failed to load icons:', error);
	}
};

// Initialize icons immediately.
initializeIcons();
