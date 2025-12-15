import { URLPopover } from '@wordpress/block-editor';
import {
	ToolbarButton,
	MenuItem,
	Button,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
	NavigableMenu,
	TextControl,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, page, linkOff } from '@wordpress/icons';
import {
	useEffect,
	useState,
	useRef,
	createInterpolateElement,
} from '@wordpress/element';
import { prependHTTP } from '@wordpress/url';
import { focus } from '@wordpress/dom';

/**
 * Link destination constants
 */
const LINK_DESTINATION_NONE = 'none';
const LINK_DESTINATION_CUSTOM = 'custom';
const LINK_DESTINATION_POST = 'post';
const NEW_TAB_REL = ['noreferrer', 'noopener'];

/**
 * LinkControl
 *
 * A reusable component for managing link controls in the block toolbar
 *
 * @param {Object}   props                 Component props
 * @param {string}   props.url             The current url value
 * @param {string}   props.linkDestination The current link destination
 * @param {string}   props.linkTarget      The current link target
 * @param {string}   props.rel             The current rel attribute
 * @param {string}   props.linkClass       The current link class
 * @param {Function} props.setAttributes   Function to update block attributes
 * @return {JSX.Element} The link control component
 */
export default function GroupLinkControl({
	url,
	linkDestination,
	linkTarget,
	rel,
	linkClass,
	setAttributes,
}) {
	// Link control states
	const [isOpen, setIsOpen] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);
	const [isEditingLink, setIsEditingLink] = useState(false);
	const [urlInput, setUrlInput] = useState(null);

	// Refs
	const autocompleteRef = useRef(null);
	const wrapperRef = useRef();

	const isLinkingToPost = linkDestination === LINK_DESTINATION_POST;

	// Focus management
	useEffect(() => {
		if (!wrapperRef.current) {
			return;
		}
		const nextFocusTarget =
			focus.focusable.find(wrapperRef.current)[0] || wrapperRef.current;
		nextFocusTarget.focus();
	}, [isEditingLink, url, isLinkingToPost]);

	// Link control functions
	const openLinkUI = () => {
		setIsOpen(true);
	};

	const startEditLink = () => {
		if (linkDestination === LINK_DESTINATION_POST) {
			// Clear the link to post destination when editing
			setAttributes({
				linkDestination: LINK_DESTINATION_NONE,
				url: '',
			});
			setUrlInput('');
		}
		setIsEditingLink(true);
	};

	const stopEditLink = () => {
		setIsEditingLink(false);
	};

	const closeLinkUI = () => {
		setUrlInput(null);
		stopEditLink();
		setIsOpen(false);
	};

	const getLinkDestinations = () => {
		return [
			{
				linkDestination: LINK_DESTINATION_POST,
				title: __('Link to current post'),
				url: undefined,
				icon: page,
			},
		];
	};

	const getUpdatedLinkTargetSettings = (value) => {
		const newLinkTarget = value ? '_blank' : undefined;

		let updatedRel;
		if (newLinkTarget) {
			const rels = (rel ?? '').split(' ');
			NEW_TAB_REL.forEach((relVal) => {
				if (!rels.includes(relVal)) {
					rels.push(relVal);
				}
			});
			updatedRel = rels.join(' ');
		} else {
			const rels = (rel ?? '')
				.split(' ')
				.filter((relVal) => NEW_TAB_REL.includes(relVal) === false);
			updatedRel = rels.length ? rels.join(' ') : undefined;
		}

		return {
			linkTarget: newLinkTarget,
			rel: updatedRel,
		};
	};

	const onSetNewTab = (value) => {
		const updatedLinkTarget = getUpdatedLinkTargetSettings(value);
		setAttributes(updatedLinkTarget);
	};

	const onSetLinkRel = (value) => {
		setAttributes({ rel: value });
	};

	const onSetLinkClass = (value) => {
		setAttributes({ linkClass: value });
	};

	const onChangeUrl = (updatedValue) => {
		setAttributes(updatedValue);
	};

	const onFocusOutside = () => {
		return (event) => {
			// The autocomplete suggestions list renders in a separate popover (in a portal),
			// so onFocusOutside fails to detect that a click on a suggestion occurred in the
			// LinkContainer. Detect clicks on autocomplete suggestions using a ref here, and
			// return to avoid the popover being closed.
			const autocompleteElement = autocompleteRef.current;
			if (
				autocompleteElement &&
				autocompleteElement.contains(event.target)
			) {
				return;
			}
			setIsOpen(false);
			setUrlInput(null);
			stopEditLink();
		};
	};

	const onSubmitLinkChange = () => {
		return (event) => {
			if (urlInput) {
				// It is possible the entered URL actually matches a named link destination.
				// This check will ensure our link destination is correct.
				const selectedDestination =
					getLinkDestinations().find(
						(destination) => destination.url === urlInput
					)?.linkDestination || LINK_DESTINATION_CUSTOM;

				onChangeUrl({
					url: prependHTTP(urlInput),
					linkDestination: selectedDestination,
				});
			}
			stopEditLink();
			setUrlInput(null);
			event.preventDefault();
		};
	};

	const onLinkRemove = () => {
		onChangeUrl({
			linkDestination: LINK_DESTINATION_NONE,
			url: undefined,
		});
	};

	const advancedOptions = (
		<VStack spacing="3">
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Open in new tab')}
				onChange={onSetNewTab}
				checked={linkTarget === '_blank'}
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__('Link relation')}
				value={rel ?? ''}
				onChange={onSetLinkRel}
				help={createInterpolateElement(
					__(
						'The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document.'
					),
					{
						a: (
							<ExternalLink href="https://developer.mozilla.org/docs/Web/HTML/Attributes/rel" />
						),
					}
				)}
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__('Link CSS class')}
				value={linkClass || ''}
				onChange={onSetLinkClass}
			/>
		</VStack>
	);

	const linkEditorValue = urlInput !== null ? urlInput : url;
	const showLinkEditor = !linkEditorValue && !isLinkingToPost;

	const urlLabel =
		linkDestination === LINK_DESTINATION_POST
			? __('Link to current post')
			: undefined;

	const PopoverChildren = () => {
		if ((url || isLinkingToPost) && !isEditingLink) {
			return (
				<>
					<URLPopover.LinkViewer
						className="block-editor-format-toolbar__link-container-content"
						url={url || '#'}
						onEditLinkClick={startEditLink}
						urlLabel={urlLabel}
					/>
					<Button
						icon={linkOff}
						label={__('Remove link')}
						onClick={() => {
							onLinkRemove();
						}}
						size="compact"
					/>
				</>
			);
		}
		return (
			<URLPopover.LinkEditor
				className="block-editor-format-toolbar__link-container-content"
				value={linkEditorValue}
				onChangeInputValue={setUrlInput}
				onSubmit={onSubmitLinkChange()}
				autocompleteRef={autocompleteRef}
			/>
		);
	};

	return (
		<>
			<ToolbarButton
				icon={link}
				className="components-toolbar__control"
				label={__('Link')}
				aria-expanded={isOpen}
				onClick={openLinkUI}
				ref={setPopoverAnchor}
				isActive={!!url || isLinkingToPost}
			/>

			{isOpen && (
				<URLPopover
					ref={wrapperRef}
					anchor={popoverAnchor}
					onFocusOutside={onFocusOutside()}
					onClose={closeLinkUI}
					renderSettings={() => advancedOptions}
					additionalControls={
						showLinkEditor && (
							<NavigableMenu>
								{getLinkDestinations().map((destination) => (
									<MenuItem
										key={destination.linkDestination}
										icon={destination.icon}
										iconPosition="left"
										onClick={() => {
											setUrlInput(null);
											onChangeUrl({
												url: undefined,
												linkDestination:
													destination.linkDestination,
											});
											stopEditLink();
										}}
									>
										{destination.title}
									</MenuItem>
								))}
							</NavigableMenu>
						)
					}
					offset={13}
				>
					{PopoverChildren()}
				</URLPopover>
			)}
		</>
	);
}
