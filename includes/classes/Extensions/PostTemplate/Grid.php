<?php
/**
 * Post Template Grid extension class.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Extensions\PostTemplate;

use Eighteen73\PulsarExtensions\Singleton;
use WP_Block;
use WP_HTML_Tag_Processor;

/**
 * Grid class.
 */
class Grid {

	use Singleton;

	/**
	 * Setup the class.
	 *
	 * @return void
	 */
	public function setup(): void {
		add_filter( 'render_block_core/post-template', [ $this, 'render_grid_classes' ], 10, 2 );
	}

	/**
	 * Apply responsive grid classes and styles to the post-template block.
	 *
	 * @param string               $block_content The block content.
	 * @param array<string, mixed> $block         The full block, including name and attributes.
	 *
	 * @return string The updated block content.
	 */
	public function render_grid_classes( string $block_content, array $block ): string {
		if ( empty( $block_content ) || empty( $block['attrs'] ) || ! is_array( $block['attrs'] ) ) {
			return $block_content;
		}

		$attributes = $block['attrs'];

		// Check if this is a grid layout in manual mode
		$layout         = $attributes['layout'] ?? null;
		$is_grid_layout = isset( $layout['type'] ) && 'grid' === $layout['type'];
		$is_manual_mode = ! isset( $layout['minimumColumnWidth'] ) || null === $layout['minimumColumnWidth'];

		if ( ! ( $is_grid_layout && $is_manual_mode ) ) {
			return $block_content;
		}

		$responsive_columns = $attributes['responsiveColumns'] ?? [];

		if ( empty( $responsive_columns ) || ! is_array( $responsive_columns ) ) {
			return $block_content;
		}

		// Generate classes and styles
		$classes = $this->generate_classes( $responsive_columns );
		$styles  = $this->generate_inline_styles( $responsive_columns );

		if ( empty( $classes ) && empty( $styles ) ) {
			return $block_content;
		}

		// Apply classes and styles to the wrapper element
		return $this->apply_classes_and_styles( $block_content, $classes, $styles );
	}

	/**
	 * Generate CSS classes from responsive columns array.
	 *
	 * @param array<int, array<string, mixed>> $responsive_columns Responsive columns configuration.
	 *
	 * @return string Space-separated class names.
	 */
	private function generate_classes( array $responsive_columns ): string {
		$classes = [];

		foreach ( $responsive_columns as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$breakpoint   = $item['breakpoint'] ?? '';
			$column_count = $item['columnCount'] ?? '';

			if ( ! empty( $breakpoint ) && ! empty( $column_count ) ) {
				$classes[] = 'is-responsive-columns-on-' . sanitize_html_class( $breakpoint );
			}
		}

		return implode( ' ', $classes );
	}

	/**
	 * Generate inline CSS styles from responsive columns array.
	 *
	 * @param array<int, array<string, mixed>> $responsive_columns Responsive columns configuration.
	 *
	 * @return string Inline style attribute value.
	 */
	private function generate_inline_styles( array $responsive_columns ): string {
		$styles = [];

		foreach ( $responsive_columns as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$breakpoint   = $item['breakpoint'] ?? '';
			$column_count = $item['columnCount'] ?? '';

			if ( ! empty( $breakpoint ) && ! empty( $column_count ) && is_numeric( $column_count ) ) {
				$breakpoint_slug = sanitize_html_class( $breakpoint );
				$styles[]        = sprintf(
					'--grid-template-columns-%s: repeat(%d, 1fr)',
					$breakpoint_slug,
					(int) $column_count
				);
			}
		}

		return implode( '; ', $styles );
	}

	/**
	 * Apply classes and styles to the block's wrapper element using WP_HTML_Tag_Processor.
	 *
	 * @param string $block_content The block content HTML.
	 * @param string $classes       Space-separated class names.
	 * @param string $styles        Inline style attribute value.
	 *
	 * @return string Updated block content.
	 */
	private function apply_classes_and_styles( string $block_content, string $classes, string $styles ): string {
		$processor = new WP_HTML_Tag_Processor( $block_content );

		// Find the <ul> tag with wp-block-post-template class
		if ( ! $processor->next_tag( [ 'class_name' => 'wp-block-post-template' ] ) ) {
			return $block_content;
		}

		// Add classes (WP_HTML_Tag_Processor handles merging with existing classes)
		if ( ! empty( $classes ) ) {
			$class_array = explode( ' ', $classes );
			foreach ( $class_array as $class ) {
				$processor->add_class( trim( $class ) );
			}
		}

		// Add inline styles (merge with existing styles if present)
		if ( ! empty( $styles ) ) {
			$existing_style = $processor->get_attribute( 'style' );
			if ( ! empty( $existing_style ) ) {
				$styles = $existing_style . '; ' . $styles;
			}
			$processor->set_attribute( 'style', $styles );
		}

		return $processor->get_updated_html();
	}
}
