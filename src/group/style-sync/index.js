/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';

/**
 * Internal dependencies
 */
import {
	STYLE_SYNC_ATTRIBUTE,
	StyleSyncToolbar,
} from '../../components/style-sync';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	// No default so unset / true / false stay distinguishable in the editor.
	[STYLE_SYNC_ATTRIBUTE]: {
		type: 'boolean',
	},
};

/**
 * BlockEdit
 *
 * @param {Object} props            Component props.
 * @param {string} props.clientId   Block client ID.
 * @param {Object} props.attributes Block attributes.
 * @return {JSX.Element} Style sync toolbar controls.
 */
function BlockEdit({ clientId, attributes }) {
	return <StyleSyncToolbar clientId={clientId} attributes={attributes} />;
}

registerBlockExtension('core/group', {
	extensionName: 'pulsar-extensions/group/style-sync',
	attributes: additionalAttributes,
	classNameGenerator: () => '',
	Edit: BlockEdit,
	order: 'after',
});
