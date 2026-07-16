/**
 * WordPress dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useRegistry, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import {
	getStyleSnapshot,
	hasStyleSnapshotChanged,
} from '../components/style-sync/attributes';
import {
	applyStyleSyncToPeers,
	disableStyleSyncOnActiveSet,
	enableStyleSyncFromContainer,
	isStyleSyncApplying,
} from '../components/style-sync/apply';
import {
	NOTICE_ID_OFFER,
	NOTICE_ID_SYNCED,
} from '../components/style-sync/constants';
import { resolveSyncContext } from '../components/style-sync/matching';

/**
 * StyleSyncManager
 *
 * Watches selection and style attribute changes to offer / apply style sync.
 *
 * @return {null} Renderless plugin.
 */
function StyleSyncManager() {
	const registry = useRegistry();
	const { createSuccessNotice, removeNotice } = useDispatch(noticesStore);

	const { selectedClientId, selectedAttributes } = useSelect((select) => {
		const { getSelectedBlockClientId, getBlockAttributes } =
			select(blockEditorStore);
		const clientId = getSelectedBlockClientId();

		return {
			selectedClientId: clientId,
			selectedAttributes: clientId ? getBlockAttributes(clientId) : null,
		};
	}, []);

	const previousClientIdRef = useRef(null);
	const previousSnapshotRef = useRef(null);

	useEffect(() => {
		if (isStyleSyncApplying()) {
			return;
		}

		if (!selectedClientId) {
			previousClientIdRef.current = null;
			previousSnapshotRef.current = null;
			return;
		}

		const snapshot = getStyleSnapshot(selectedAttributes || {});
		const selectionChanged =
			previousClientIdRef.current !== selectedClientId;

		if (selectionChanged) {
			previousClientIdRef.current = selectedClientId;
			previousSnapshotRef.current = snapshot;
			removeNotice(NOTICE_ID_OFFER);
			return;
		}

		if (!hasStyleSnapshotChanged(previousSnapshotRef.current, snapshot)) {
			return;
		}

		previousSnapshotRef.current = snapshot;

		const context = resolveSyncContext(registry.select, selectedClientId);

		if (context?.mode === 'offer') {
			const similarCount = Math.max(context.similar?.length || 0, 1);

			createSuccessNotice(
				sprintf(
					/* translators: %d: total number of similar blocks in the sync set */
					_n(
						'Sync %d similar block?',
						'Sync %d similar blocks?',
						similarCount,
						'pulsar-extensions'
					),
					similarCount
				),
				{
					type: 'snackbar',
					id: NOTICE_ID_OFFER,
					isDismissible: true,
					actions: [
						{
							label: __('Sync', 'pulsar-extensions'),
							onClick: () => {
								enableStyleSyncFromContainer(
									registry,
									context.container.clientId
								);
								removeNotice(NOTICE_ID_OFFER);
							},
						},
					],
				}
			);
			return;
		}

		if (context?.mode !== 'sync') {
			return;
		}

		const updatedCount = applyStyleSyncToPeers(
			registry,
			selectedClientId,
			context.container.clientId,
			context.peers
		);

		if (updatedCount < 1) {
			return;
		}

		// Include the source block in the total (peers updated + the one edited).
		const syncedCount = updatedCount + 1;

		removeNotice(NOTICE_ID_OFFER);
		createSuccessNotice(
			sprintf(
				/* translators: %d: total blocks in the sync set, including the source */
				_n(
					'Synced %d block',
					'Synced %d blocks',
					syncedCount,
					'pulsar-extensions'
				),
				syncedCount
			),
			{
				type: 'snackbar',
				id: NOTICE_ID_SYNCED,
				isDismissible: true,
				actions: [
					{
						label: __('Unsync', 'pulsar-extensions'),
						onClick: () => {
							disableStyleSyncOnActiveSet(
								registry,
								context.container.clientId,
								context.activeAncestor?.clientId
							);
							removeNotice(NOTICE_ID_SYNCED);
						},
					},
				],
			}
		);
	}, [
		selectedClientId,
		selectedAttributes,
		registry,
		createSuccessNotice,
		removeNotice,
	]);

	return null;
}

registerPlugin('pulsar-extensions-style-sync', {
	render: StyleSyncManager,
});
