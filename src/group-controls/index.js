import { addFilter } from '@wordpress/hooks';
import { useState } from '@wordpress/element';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import {
	ToolbarButton,
	Popover,
	MenuGroup,
	MenuItem,
	Button,
	Icon,
	ToggleControl,
	DimensionControl,
	NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, page, linkOff } from '@wordpress/icons';
import { useEffect } from '@wordpress/element';

/**
 * Filter the BlockEdit object and add group controls.
 *
 * @param {Object} BlockEdit
 */
function addGroupControls(BlockEdit) {
	return (props) => {
		// Support both group and column blocks
		const supportsLinking = ['core/group', 'core/column'].includes(
			props.name
		);
		const supportsStacking = props.name === 'core/group';

		if (!supportsLinking && !supportsStacking) {
			return <BlockEdit {...props} />;
		}

		const [isEditingURL, setIsEditingURL] = useState(false);
		const [popoverAnchor, setPopoverAnchor] = useState(null);
		const { attributes, setAttributes } = props;
		const {
			href,
			linkDestination,
			linkTarget,
			isStackedOnMobile,
			layout,
			stickyScrollOffset,
			stickyZIndex,
			stickyOnScrollUp,
			unstickOnMobile,
		} = attributes;

		const isRowLayout =
			layout?.type === 'flex' && layout?.orientation !== 'vertical';
		const isFlexWrapEnabled = layout?.flexWrap === 'wrap';

		// Watch for flexWrap changes and disable stack if flexWrap is enabled
		useEffect(() => {
			if (isFlexWrapEnabled && isStackedOnMobile) {
				setAttributes({ isStackedOnMobile: false });
			}
		}, [isFlexWrapEnabled, isStackedOnMobile, setAttributes]);

		return (
			<>
				<BlockEdit {...props} />
				{supportsLinking && (
					<BlockControls group="block">
						<ToolbarButton
							ref={setPopoverAnchor}
							name="link"
							icon={link}
							title={__('Link', 'pulsar-extensions')}
							onClick={() => setIsEditingURL(true)}
							isActive={
								!!href ||
								linkDestination === 'post' ||
								isEditingURL
							}
						/>
						{isEditingURL && (
							<Popover
								anchor={popoverAnchor}
								onClose={() => setIsEditingURL(false)}
								placement="bottom"
								focusOnMount={true}
								offset={12}
								className="pulsar-extensions-advanced-group__link-popover"
								variant="alternate"
							>
								{linkDestination !== 'post' && (
									<LinkControl
										value={{
											url: href,
											opensInNewTab:
												linkTarget === '_blank',
										}}
										onChange={({
											url: newURL = '',
											opensInNewTab,
										}) => {
											setAttributes({
												href: newURL,
												linkDestination: newURL
													? 'custom'
													: undefined,
												linkTarget: opensInNewTab
													? '_blank'
													: undefined,
											});
										}}
										onRemove={() =>
											setAttributes({
												href: undefined,
												linkDestination: undefined,
												linkTarget: undefined,
											})
										}
									/>
								)}
								{!href && !linkDestination && (
									<div className="enable-linked-groups__link-popover-menu">
										<MenuGroup>
											<MenuItem
												icon={page}
												iconPosition="left"
												info={__(
													'Use when the Group is located in a Query block.',
													'pulsar-extensions'
												)}
												onClick={() =>
													setAttributes({
														linkDestination: 'post',
													})
												}
											>
												{__(
													'Link to current post',
													'pulsar-extensions'
												)}
											</MenuItem>
										</MenuGroup>
									</div>
								)}
								{linkDestination === 'post' && (
									<div className="enable-linked-groups__link-popover-post-selected">
										<div className="enable-linked-groups__link-popover-post-selected-label">
											<span className="enable-linked-groups__link-popover-post-selected-icon">
												<Icon icon={page} />
											</span>
											{__(
												'Linked to current post',
												'pulsar-extensions'
											)}
										</div>
										<Button
											icon={linkOff}
											label={__(
												'Remove link',
												'pulsar-extensions'
											)}
											onClick={() =>
												setAttributes({
													linkDestination: undefined,
												})
											}
										/>
									</div>
								)}
							</Popover>
						)}
					</BlockControls>
				)}
				{supportsStacking && isRowLayout && (
					<InspectorControls>
						<div style={{ padding: '0 16px 8px' }}>
							<ToggleControl
								label={__(
									'Stack row on mobile',
									'pulsar-extensions'
								)}
								help={
									isFlexWrapEnabled
										? __(
												'Disabled when "Allow to wrap to multiple lines" is enabled',
												'pulsar-extensions'
											)
										: __(
												'More predictable control over when the row stacks',
												'pulsar-extensions'
											)
								}
								checked={isStackedOnMobile}
								disabled={isFlexWrapEnabled}
								onChange={() => {
									setAttributes({
										isStackedOnMobile: !isStackedOnMobile,
									});
								}}
							/>
						</div>
					</InspectorControls>
				)}
				{supportsStacking &&
					attributes?.style?.position?.type === 'sticky' && (
						<InspectorControls group="position">
							<ToggleControl
								label={__(
									'Hide on Scroll Down',
									'pulsar-extensions'
								)}
								help={__(
									'Hide sticky element when scrolling down, show when scrolling up.',
									'pulsar-extensions'
								)}
								checked={stickyOnScrollUp || false}
								onChange={(value) =>
									setAttributes({ stickyOnScrollUp: value })
								}
								className="pulsar-extensions-position-controls"
							/>
							<ToggleControl
								label={__(
									'Unstick on Mobile',
									'pulsar-extensions'
								)}
								help={__(
									'Disable sticky positioning on mobile devices (below 600px)',
									'ollie-pro'
								)}
								checked={unstickOnMobile || false}
								onChange={(value) =>
									setAttributes({ unstickOnMobile: value })
								}
								className="pulsar-extensions-position-controls"
							/>
							<DimensionControl
								label={__('Top Offset', 'pulsar-extensions')}
								help={__(
									'Distance from the top edge when stuck to the viewport',
									'ollie-pro'
								)}
								value={stickyScrollOffset || '0px'}
								onChange={(value) =>
									setAttributes({ stickyScrollOffset: value })
								}
								units={['px', 'em', 'rem', '%']}
								type="unit"
								max={500}
								className="pulsar-extensions-position-controls"
							/>
							<NumberControl
								label={__('Z-Index Position', 'ollie-pro')}
								help={__(
									'Control stacking order. Higher values appear on top.',
									'ollie-pro'
								)}
								value={stickyZIndex ?? 0}
								onChange={(value) => {
									// Convert to number and set to null if 0
									const numValue =
										value === '' || value === undefined
											? 0
											: Number(value);
									setAttributes({
										stickyZIndex:
											numValue === 0 ? null : numValue,
									});
								}}
								step={1}
								className="ollie-position-controls"
							/>
						</InspectorControls>
					)}
			</>
		);
	};
}

addFilter(
	'editor.BlockEdit',
	'pulsar-extensions/add-group-controls',
	addGroupControls
);
