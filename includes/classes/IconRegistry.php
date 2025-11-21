<?php
/**
 * Icon registry service.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions;

/**
 * Handles discovery and normalization of icon sets.
 */
class IconRegistry {

	use Singleton;

	/**
	 * Cache key for icon sets.
	 *
	 * @var string
	 */
	private const CACHE_KEY = 'pulsar_extensions_icon_sets';

	/**
	 * Cache duration (24 hours).
	 *
	 * @var int
	 */
	private const CACHE_EXPIRATION = DAY_IN_SECONDS;

	/**
	 * Get all available icon sets.
	 *
	 * Applies filters so themes/plugins can register additional sets.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_icon_sets(): array {
		$is_development = Plugin::is_development_mode();

		if ( ! $is_development ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( false !== $cached && is_array( $cached ) ) {
				return $cached;
			}
		}

		$icon_sets = $this->load_plugin_icon_sets();

		/**
		 * Filter the available icon sets.
		 *
		 * Allows themes and plugins to add or modify icon definitions.
		 *
		 * @param array<int, array<string, mixed>> $icon_sets Icon sets.
		 */
		$icon_sets = apply_filters( 'pulsar_extensions_icon_sets', $icon_sets );

		$icon_sets = $this->normalize_icon_sets( $icon_sets );

		if ( empty( $icon_sets ) ) {
			return [];
		}

		if ( ! $is_development ) {
			set_transient( self::CACHE_KEY, $icon_sets, self::CACHE_EXPIRATION );
		}

		return $icon_sets;
	}

	/**
	 * Build the CSS needed for icon utility classes.
	 *
	 * @return string
	 */
	public function get_icon_utility_css(): string {
		$icon_sets = $this->get_icon_sets();

		if ( empty( $icon_sets ) ) {
			return '';
		}

		return $this->get_icon_variable_rules( $icon_sets );
	}

	/**
	 * Clear the icon set cache.
	 *
	 * @return bool
	 */
	public function clear_cache(): bool {
		return delete_transient( self::CACHE_KEY );
	}

	/**
	 * Load icon sets from the plugin's assets directory.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function load_plugin_icon_sets(): array {
		$icons_path = PULSAR_EXTENSIONS_PATH . 'assets/icons/';

		if ( ! is_dir( $icons_path ) ) {
			return [];
		}

		$icon_sets = [];

		$icon_set_dirs = glob( $icons_path . '*', GLOB_ONLYDIR );

		if ( false === $icon_set_dirs ) {
			return $icon_sets;
		}

		foreach ( $icon_set_dirs as $icon_set_dir ) {
			$icon_set_name = basename( $icon_set_dir );
			$icons         = $this->load_icons_from_directory( $icon_set_dir );

			if ( empty( $icons ) ) {
				continue;
			}

			$icon_sets[] = [
				'name'  => $icon_set_name,
				'label' => $this->format_label( $icon_set_name ),
				'icons' => $icons,
			];
		}

		return $icon_sets;
	}

	/**
	 * Load SVG icons from a directory.
	 *
	 * @param string $icon_set_path Directory path.
	 *
	 * @return array<int, array<string, string>>
	 */
	private function load_icons_from_directory( string $icon_set_path ): array {
		$icons     = [];
		$svg_files = glob( $icon_set_path . '/*.svg' );

		if ( false === $svg_files ) {
			return $icons;
		}

		foreach ( $svg_files as $svg_file ) {
			$icon_name  = basename( $svg_file, '.svg' );
			$svg_source = $this->get_svg_source( $svg_file );

			if ( empty( $svg_source ) ) {
				continue;
			}

			$icons[] = [
				'name'   => $icon_name,
				'label'  => $this->format_label( $icon_name ),
				'source' => $svg_source,
			];
		}

		return $icons;
	}

	/**
	 * Normalize icon sets, ensuring consistent structure.
	 *
	 * @param array<int, array<string, mixed>> $icon_sets Icon set definitions.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function normalize_icon_sets( array $icon_sets ): array {
		$normalized = [];

		foreach ( $icon_sets as $icon_set ) {
			if ( ! is_array( $icon_set ) ) {
				continue;
			}

			$name = $this->sanitize_slug( $icon_set['name'] ?? '' );

			if ( empty( $name ) ) {
				continue;
			}

			$icons = $icon_set['icons'] ?? [];

			if ( ! is_array( $icons ) || empty( $icons ) ) {
				continue;
			}

			$normalized_icons = $this->normalize_icons( $name, $icons );

			if ( empty( $normalized_icons ) ) {
				continue;
			}

			$normalized[] = [
				'name'  => $name,
				'label' => $this->get_label( $icon_set['label'] ?? '', $name ),
				'icons' => $normalized_icons,
			];
		}

		return $normalized;
	}

	/**
	 * Normalise icons within a set.
	 *
	 * @param string $icon_set_name Icon set slug.
	 * @param array  $icons Icon definitions.
	 *
	 * @return array<int, array<string, string>>
	 */
	private function normalize_icons( string $icon_set_name, array $icons ): array {
		$normalized = [];

		foreach ( $icons as $icon ) {
			if ( ! is_array( $icon ) ) {
				continue;
			}

			$name   = $this->sanitize_slug( $icon['name'] ?? '' );
			$source = $this->prepare_svg_source( $icon['source'] ?? '' );

			if ( empty( $name ) || empty( $source ) ) {
				continue;
			}

			$normalized[] = [
				'name'   => $name,
				'label'  => $this->get_label( $icon['label'] ?? '', $name ),
				'source' => $source,
			];
		}

		return $normalized;
	}

	/**
	 * Get the SVG source content from a file.
	 *
	 * @param string $svg_file Path to the SVG file.
	 *
	 * @return string
	 */
	private function get_svg_source( string $svg_file ): string {
		if ( ! file_exists( $svg_file ) || ! is_readable( $svg_file ) ) {
			return '';
		}

		$svg_content = file_get_contents( $svg_file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( false === $svg_content ) {
			return '';
		}

		if ( ! str_contains( $svg_content, '<svg' ) ) {
			return '';
		}

		return trim( $svg_content );
	}

	/**
	 * Prepare an SVG string for downstream usage.
	 *
	 * @param string $source Raw SVG markup.
	 *
	 * @return string
	 */
	private function prepare_svg_source( string $source ): string {
		$source = trim( $source );

		if ( empty( $source ) || ! str_contains( $source, '<svg' ) ) {
			return '';
		}

		return $source;
	}

	/**
	 * Create icon-specific CSS rules for mask custom property values.
	 *
	 * @param array<int, array<string, mixed>> $icon_sets Icon sets.
	 *
	 * @return string
	 */
	private function get_icon_variable_rules( array $icon_sets ): string {
		$css = '';

		foreach ( $icon_sets as $icon_set ) {
			$set_name = $icon_set['name'];

			foreach ( $icon_set['icons'] as $icon ) {
				$icon_name = $icon['name'];
				$mask_url  = $this->svg_to_data_uri( $icon['source'] );

				if ( empty( $mask_url ) ) {
					continue;
				}

				$selector = $this->get_icon_selector( $set_name, $icon_name );

				$css .= sprintf(
					'%1$s{--icon:%2$s;}',
					$selector,
					$mask_url
				);
			}
		}

		return $css;
	}

	/**
	 * Convert an SVG string to a data URI for CSS usage.
	 *
	 * @param string $svg SVG markup.
	 *
	 * @return string
	 */
	private function svg_to_data_uri( string $svg ): string {
		$svg     = preg_replace( '/>\s+</', '><', $svg );
		$svg     = preg_replace( '/\s+/', ' ', $svg );
		$svg     = str_replace( [ "\n", "\r", "\t" ], ' ', $svg );
		$svg     = trim( $svg ?? '' );
		$svg     = str_replace( '"', '\'', $svg );
		$encoded = rawurlencode( $svg );

		return sprintf( 'url("data:image/svg+xml,%s")', $encoded );
	}

	/**
	 * Build the CSS selector for a specific icon.
	 *
	 * @param string $icon_set Icon set slug.
	 * @param string $icon     Icon slug.
	 *
	 * @return string
	 */
	private function get_icon_selector( string $icon_set, string $icon ): string {
		$set_slug  = sanitize_html_class( $icon_set );
		$icon_slug = sanitize_html_class( $icon );

		return '.has-icon-' . $set_slug . '-' . $icon_slug;
	}

	/**
	 * Sanitize a slug value.
	 *
	 * @param string $value Raw value.
	 *
	 * @return string
	 */
	private function sanitize_slug( string $value ): string {
		$value = strtolower( $value );

		return sanitize_title( $value );
	}

	/**
	 * Format a label, falling back to a slug.
	 *
	 * @param string $label Provided label.
	 * @param string $slug  Fallback slug.
	 *
	 * @return string
	 */
	private function get_label( string $label, string $slug ): string {
		$label = trim( $label );

		if ( ! empty( $label ) ) {
			return $label;
		}

		return $this->format_label( $slug );
	}

	/**
	 * Convert a slug to a human readable label.
	 *
	 * @param string $value Slug value.
	 *
	 * @return string
	 */
	private function format_label( string $value ): string {
		$value = str_replace( '-', ' ', $value );

		return ucwords( $value );
	}
}
