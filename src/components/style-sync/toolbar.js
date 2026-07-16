/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useRegistry } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { update } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	disableStyleSyncFromContainer,
	enableStyleSyncFromContainer,
} from './apply';
import { STYLE_SYNC_ATTRIBUTE } from './constants';
import './editor.scss';

/**
 * Style sync toolbar toggle for Group / Columns containers.
 *
 * @param {Object} props            Component props.
 * @param {string} props.clientId   Block client ID.
 * @param {Object} props.attributes Block attributes.
 * @return {JSX.Element} Toolbar controls.
 */
export default function StyleSyncToolbar({ clientId, attributes }) {
	const registry = useRegistry();
	const isSyncEnabled = attributes?.[STYLE_SYNC_ATTRIBUTE] === true;

	return (
		<BlockControls group="other">
			<ToolbarGroup>
				<ToolbarButton
					icon={update}
					label={
						isSyncEnabled
							? __('Disable style sync', 'pulsar-extensions')
							: __('Enable style sync', 'pulsar-extensions')
					}
					isPressed={isSyncEnabled}
					className="pulsar-style-sync-toolbar-button"
					onClick={() => {
						if (isSyncEnabled) {
							disableStyleSyncFromContainer(registry, clientId);
							return;
						}

						enableStyleSyncFromContainer(registry, clientId);
					}}
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}
