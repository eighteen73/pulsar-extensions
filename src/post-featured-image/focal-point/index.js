/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { FocalPointPicker } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

const PostFeaturedImageFocalPoint = () => {
	const postType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	// get the posts featured image id
	const featuredImageId = useSelect(
		(select) =>
			select('core/editor').getEditedPostAttribute('featured_media'),
		[]
	);

	// get the featured image url using the id
	const featuredImageUrl = useSelect(
		(select) => {
			if (!featuredImageId) {
				return null;
			}
			const image = select('core').getEntityRecord(
				'postType',
				'attachment',
				featuredImageId
			);
			return image?.source_url;
		},
		[featuredImageId]
	);

	const { _thumbnail_focal_point: focalPoint } = meta;

	const onChangeFocalPoint = (value) => {
		setMeta({
			...meta,
			_thumbnail_focal_point: value,
		});
	};

	return (
		<>
			{featuredImageUrl && (
				<PluginDocumentSettingPanel
					name="featured-image"
					title={__('Featured Image', 'pulsar-extensions')}
					className="featured-image"
				>
					<FocalPointPicker
						label={__('Focal Point', 'pulsar-extensions')}
						value={focalPoint || { x: 0.5, y: 0.5 }}
						url={featuredImageUrl}
						onChange={onChangeFocalPoint}
						__nextHasNoMarginBottom
					/>
				</PluginDocumentSettingPanel>
			)}
		</>
	);
};

/**
 * Register extension.
 */
registerPlugin('featured-image-panel', {
	render: PostFeaturedImageFocalPoint,
});
