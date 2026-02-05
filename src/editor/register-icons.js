/**
 * Register icons from the REST API.
 *
 * Fetches icons from the Pulsar Extensions REST API (WordPress 7.0 compatible format)
 * and converts them to icon sets format for IconPicker compatibility.
 */

import { registerIcons } from '@10up/block-components/api/register-icons';
import apiFetch from '@wordpress/api-fetch';

let iconsInitialized = false;

/**
 * Convert flat array of icons to icon sets format for IconPicker.
 *
 * Groups icons by namespace prefix (e.g., all 'pulsar-extensions/*' icons in one set).
 *
 * @param {Array} icons Flat array of icons with namespaced names.
 * @return {Array} Array of icon sets compatible with IconPicker.
 */
const convertIconsToSets = (icons) => {
	if (!Array.isArray(icons) || icons.length === 0) {
		return [];
	}

	// Group icons by namespace
	const iconSetsMap = {};

	icons.forEach((icon) => {
		if (!icon.name || !icon.content) {
			return;
		}

		// Extract namespace from icon name (e.g., 'pulsar-extensions/arrow-right' -> 'pulsar-extensions')
		const namespaceMatch = icon.name.match(/^([^/]+)/);
		if (!namespaceMatch) {
			return;
		}

		const namespace = namespaceMatch[1];
		const iconName = icon.name.substring(namespace.length + 1); // Remove namespace prefix

		if (!iconSetsMap[namespace]) {
			iconSetsMap[namespace] = {
				name: namespace,
				label: namespace
					.split('-')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' '),
				icons: [],
			};
		}

		iconSetsMap[namespace].icons.push({
			name: iconName,
			label: icon.label || iconName,
			source: icon.content,
		});
	});

	return Object.values(iconSetsMap);
};

/**
 * Fetch and register all icons.
 */
const initializeIcons = async () => {
	if (iconsInitialized) {
		return;
	}

	try {
		const icons = await apiFetch({
			path: '/pulsar-extensions/v1/icons',
		});

		if (!Array.isArray(icons) || icons.length === 0) {
			return;
		}

		// Convert flat array to icon sets format for IconPicker
		const iconSets = convertIconsToSets(icons);

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
