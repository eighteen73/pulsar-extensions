<?php
/**
 * Sticky Offset Registry.
 *
 * Generates utility classes for sticky position offsets based on theme.json spacing scale.
 *
 * @package Eighteen73\PulsarExtensions
 */

declare(strict_types=1);

namespace Eighteen73\PulsarExtensions\Registries;

use Eighteen73\PulsarExtensions\Plugin;
use Eighteen73\PulsarExtensions\Singleton;
use Eighteen73\PulsarExtensions\StyleEngine\StylesheetGenerator;

/**
 * Manages sticky offset utility classes.
 */
class StickyOffsetRegistry implements StylesheetRegistryInterface {

	use Singleton;

	/**
	 * Cache key for sticky offset styles.
	 *
	 * @var string
	 */
	private const CACHE_KEY = 'pulsar_extensions_sticky_offset_styles';

	/**
	 * Cache duration (24 hours).
	 *
	 * @var int
	 */
	private const CACHE_EXPIRATION = DAY_IN_SECONDS;

	/**
	 * Get sticky offset utility CSS.
	 *
	 * @return string
	 */
	public function get_sticky_offset_css(): string {
		$is_development = Plugin::is_development_mode();

		if ( ! $is_development ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( false !== $cached && is_string( $cached ) ) {
				return $cached;
			}
		}

		$spacing_scale = $this->get_spacing_scale();

		if ( empty( $spacing_scale ) ) {
			return '';
		}

		$css = $this->generate_sticky_offset_classes( $spacing_scale );

		if ( ! $is_development ) {
			set_transient( self::CACHE_KEY, $css, self::CACHE_EXPIRATION );
		}

		return $css;
	}

	/**
	 * Get the spacing scale from theme.json.
	 *
	 * @return array<int, array<string, string>>
	 */
	private function get_spacing_scale(): array {
		// Get spacing presets from theme.json
		$settings = wp_get_global_settings();
		$spacing  = $settings['spacing']['spacingSizes'] ?? [];

		if ( empty( $spacing ) ) {
			return [];
		}

		// The spacing scale can be nested with 'default' and 'theme' keys
		// We want to use the theme spacing scale if it exists, otherwise use all
		$spacing_items = [];

		if ( isset( $spacing['theme'] ) && is_array( $spacing['theme'] ) ) {
			// Use theme spacing scale (preferred)
			$spacing_items = $spacing['theme'];
		} elseif ( isset( $spacing['default'] ) && is_array( $spacing['default'] ) ) {
			// Fallback to default spacing scale
			$spacing_items = $spacing['default'];
		} elseif ( isset( $spacing[0] ) ) {
			// Already a flat array
			$spacing_items = $spacing;
		} else {
			// Merge all spacing scales
			foreach ( $spacing as $scale ) {
				if ( is_array( $scale ) ) {
					$spacing_items = array_merge( $spacing_items, $scale );
				}
			}
		}

		/**
		 * Filter the spacing scale used for sticky offsets.
		 *
		 * Allows themes to customize which spacing values are available.
		 *
		 * @param array $spacing_items Array of spacing preset definitions.
		 */
		return apply_filters( 'pulsar_extensions_sticky_offset_spacing', $spacing_items );
	}

	/**
	 * Generate sticky offset utility classes.
	 *
	 * Generates classes like:
	 * .has-sticky-offset-small { top: calc(var(--wp--preset--spacing--small) + var(--wp-admin--admin-bar--position-offset, 0px)) !important; }
	 *
	 * @param array<int, array<string, string>> $spacing_scale Spacing preset definitions.
	 *
	 * @return string
	 */
	private function generate_sticky_offset_classes( array $spacing_scale ): string {
		$generator = new StylesheetGenerator();

		foreach ( $spacing_scale as $spacing ) {
			$slug = $spacing['slug'] ?? '';

			if ( empty( $slug ) ) {
				continue;
			}

			// Generate the top offset class
			$rule = $generator->generate_utility_class(
				".is-sticky-offset-{$slug}",
				[
					'top' => "calc(var(--wp--preset--spacing--{$slug}) + var(--wp-admin--admin-bar--position-offset, 0px))",
				],
				false
			);

			$generator->add_rule( $rule );
		}

		// Also generate a "none" option for no offset (just admin bar)
		$rule = $generator->generate_utility_class(
			'.is-sticky-offset-0',
			[
				'top' => 'calc(0px + var(--wp-admin--admin-bar--position-offset, 0px))',
			],
			false
		);

		$generator->add_rule( $rule );

		return $generator->get_stylesheet();
	}

	/**
	 * Get the generated CSS stylesheet.
	 *
	 * Implements StylesheetRegistryInterface.
	 *
	 * @return string The generated CSS.
	 */
	public function get_css(): string {
		return $this->get_sticky_offset_css();
	}

	/**
	 * Get the stylesheet handle for wp_enqueue_style().
	 *
	 * Implements StylesheetRegistryInterface.
	 *
	 * @return string The stylesheet handle.
	 */
	public function get_handle(): string {
		return 'pulsar-extensions-sticky-offset-utilities';
	}

	/**
	 * Clear the cache.
	 *
	 * @return bool
	 */
	public function clear_cache(): bool {
		return delete_transient( self::CACHE_KEY );
	}
}
