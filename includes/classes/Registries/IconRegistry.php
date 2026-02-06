<?php
/**
 * Icon registry service.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Registries;

use Eighteen73\PulsarExtensions\Plugin;
use Eighteen73\PulsarExtensions\Singleton;
use Eighteen73\PulsarExtensions\StyleEngine\StylesheetGenerator;

/**
 * Handles discovery and normalization of icons.
 */
class IconRegistry implements StylesheetRegistryInterface {

	use Singleton;

	/**
	 * Icon namespace prefix.
	 *
	 * @var string
	 */
	private const NAMESPACE = 'pulsar-extensions';

	/**
	 * Cache key for icons.
	 *
	 * @var string
	 */
	private const CACHE_KEY = 'pulsar_extensions_icons';

	/**
	 * Cache duration (24 hours).
	 *
	 * @var int
	 */
	private const CACHE_EXPIRATION = DAY_IN_SECONDS;

	/**
	 * Get all available icons.
	 *
	 * Returns a flat array of icons with namespaced names.
	 * Applies filters so themes/plugins can register additional icons.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_icons(): array {
		$is_development = Plugin::is_development_mode();

		if ( ! $is_development ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( false !== $cached && is_array( $cached ) ) {
				return $cached;
			}
		}

		$icons = $this->load_plugin_icons();

		/**
		 * Filter the available icons.
		 *
		 * Allows themes and plugins to add or modify icon definitions.
		 *
		 * @param array<int, array<string, mixed>> $icons Icons array.
		 */
		$icons = apply_filters( 'pulsar_extensions_icons', $icons );

		$icons = $this->normalize_icons( $icons );

		if ( empty( $icons ) ) {
			return [];
		}

		if ( ! $is_development ) {
			set_transient( self::CACHE_KEY, $icons, self::CACHE_EXPIRATION );
		}

		return $icons;
	}

	/**
	 * Build the CSS needed for icon utility classes.
	 *
	 * @return string
	 */
	public function get_icon_utility_css(): string {
		$icons = $this->get_icons();

		if ( empty( $icons ) ) {
			return '';
		}

		return $this->get_icon_variable_rules( $icons );
	}

	/**
	 * Get the generated CSS stylesheet.
	 *
	 * Implements StylesheetRegistryInterface.
	 *
	 * @return string The generated CSS.
	 */
	public function get_css(): string {
		return $this->get_icon_utility_css();
	}

	/**
	 * Get the stylesheet handle for wp_enqueue_style().
	 *
	 * Implements StylesheetRegistryInterface.
	 *
	 * @return string The stylesheet handle.
	 */
	public function get_handle(): string {
		return 'pulsar-extensions-icon-utilities';
	}

	/**
	 * Clear the icon cache.
	 *
	 * @return bool
	 */
	public function clear_cache(): bool {
		return delete_transient( self::CACHE_KEY );
	}

	/**
	 * Register an icon for use in Pulsar Extensions.
	 *
	 * Helper function for themes and plugins to easily register icons.
	 * Icons with the same name will overwrite previously registered icons.
	 *
	 * @param string $icon_name       Icon name including namespace (e.g., 'pulsar-extensions/arrow-right').
	 * @param string $label           Human-readable label for the icon.
	 * @param string $content_or_path SVG content as string, or file path to SVG file.
	 * @param bool   $is_file_path    Whether $content_or_path is a file path (true) or SVG content (false).
	 * @return bool True if icon was registered successfully.
	 */
	public static function register_icon( string $icon_name, string $label, string $content_or_path, bool $is_file_path = false ): bool {
		// Ensure icon name has namespace separator
		if ( ! str_contains( $icon_name, '/' ) ) {
			_doing_it_wrong(
				__METHOD__,
				esc_html__( 'Icon name must include a namespace (e.g., "theme-name/icon-name").', 'pulsar-extensions' ),
				'1.0.0'
			);
			return false;
		}

		$icon_data = [
			'name'  => $icon_name,
			'label' => $label,
		];

		if ( $is_file_path ) {
			$icon_data['filePath'] = $content_or_path;
		} else {
			$icon_data['content'] = $content_or_path;
		}

		/**
		 * Filter to add or modify icons.
		 *
		 * Themes and plugins can use this filter to register icons.
		 * Icons with the same name will overwrite previous registrations.
		 *
		 * @param array<int, array<string, mixed>> $icons Existing icons array.
		 * @return array<int, array<string, mixed>> Modified icons array.
		 */
		add_filter(
			'pulsar_extensions_icons',
			function ( array $icons ) use ( $icon_data ): array {
				// Add the new icon (will overwrite if name matches)
				$icons[] = $icon_data;
				return $icons;
			},
			10
		);

		// Clear cache so new icon is available immediately
		self::instance()->clear_cache();

		return true;
	}

	/**
	 * Load icons from the plugin's assets directory.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function load_plugin_icons(): array {
		$icons_path = PULSAR_EXTENSIONS_PATH . 'assets/icons/';

		if ( ! is_dir( $icons_path ) ) {
			return [];
		}

		$icons = [];

		$icon_set_dirs = glob( $icons_path . '*', GLOB_ONLYDIR );

		if ( false === $icon_set_dirs ) {
			return $icons;
		}

		foreach ( $icon_set_dirs as $icon_set_dir ) {
			$icon_set_name = basename( $icon_set_dir );
			$set_icons     = $this->load_icons_from_directory( $icon_set_dir, $icon_set_name );

			if ( empty( $set_icons ) ) {
				continue;
			}

			$icons = array_merge( $icons, $set_icons );
		}

		return $icons;
	}

	/**
	 * Load SVG icons from a directory.
	 *
	 * @param string $icon_set_path Directory path.
	 * @param string $icon_set_name  Icon set name (directory name).
	 *
	 * @return array<int, array<string, string>>
	 */
	private function load_icons_from_directory( string $icon_set_path, string $icon_set_name ): array {
		$icons     = [];
		$svg_files = glob( $icon_set_path . '/*.svg' );

		if ( false === $svg_files ) {
			return $icons;
		}

		foreach ( $svg_files as $svg_file ) {
			$icon_name   = basename( $svg_file, '.svg' );
			$svg_content = $this->get_svg_source( $svg_file );

			if ( empty( $svg_content ) ) {
				continue;
			}

			// Create namespaced icon name: pulsar-extensions/icon-name
			$namespaced_name = self::NAMESPACE . '/' . $icon_name;

			$icons[] = [
				'name'    => $namespaced_name,
				'label'   => $this->format_label( $icon_name ),
				'content' => $svg_content,
			];
		}

		return $icons;
	}

	/**
	 * Normalize icons, ensuring consistent structure.
	 *
	 * Supports both 'content' and 'filePath' properties (like WordPress core).
	 * Icons with the same name will overwrite previous registrations.
	 *
	 * @param array<int, array<string, mixed>> $icons Icon definitions.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function normalize_icons( array $icons ): array {
		$normalized = [];

		foreach ( $icons as $icon ) {
			if ( ! is_array( $icon ) ) {
				continue;
			}

			$name = $icon['name'] ?? '';

			// Ensure icon name is a string and contains namespace separator
			if ( ! is_string( $name ) || empty( $name ) || ! str_contains( $name, '/' ) ) {
				continue;
			}

			// Support both 'content' and 'filePath' (like WordPress core)
			$content   = $icon['content'] ?? '';
			$file_path = $icon['filePath'] ?? '';

			// Must have either content or filePath
			if ( empty( $content ) && empty( $file_path ) ) {
				continue;
			}

			// If both are provided, prefer content (like core does)
			if ( ! empty( $content ) && ! empty( $file_path ) ) {
				_doing_it_wrong(
					__METHOD__,
					esc_html__( 'Icons must provide either `content` or `filePath`, not both.', 'pulsar-extensions' ),
					'1.0.0'
				);
				// Use content if both provided
				$file_path = '';
			}

			// Prepare content - either use provided content or load from filePath
			if ( ! empty( $content ) ) {
				$prepared_content = $this->prepare_svg_content( $content );
			} elseif ( ! empty( $file_path ) ) {
				$prepared_content = $this->get_svg_source( $file_path );
			} else {
				continue;
			}

			if ( empty( $prepared_content ) ) {
				continue;
			}

			// Use icon name as key to allow overwriting (themes can replace plugin icons)
			$normalized[ $name ] = [
				'name'    => $name,
				'label'   => $this->get_label( $icon['label'] ?? '', $name ),
				'content' => $prepared_content,
			];
		}

		// Return as indexed array (values only)
		return array_values( $normalized );
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
	 * @param string $content Raw SVG markup.
	 *
	 * @return string
	 */
	private function prepare_svg_content( string $content ): string {
		$content = trim( $content );

		if ( empty( $content ) || ! str_contains( $content, '<svg' ) ) {
			return '';
		}

		return $content;
	}

	/**
	 * Generate CSS utility classes for icons.
	 *
	 * This follows WordPress's class generation pattern from WP_Theme_JSON::compute_preset_classes()
	 * but adapted for icons that use a local CSS variable approach.
	 *
	 * WordPress generates: .has-{slug}-{property} { {property}: var(--wp--preset--{type}--{slug}) !important; }
	 * This generates: .has-icon-{namespace}-{name} { --icon: url(...) !important; }
	 *
	 * The --icon variable is then consumed by block styles (e.g., mask-image: var(--icon)).
	 *
	 * @param array<int, array<string, mixed>> $icons Icons array.
	 *
	 * @return string
	 */
	private function get_icon_variable_rules( array $icons ): string {
		$generator = new StylesheetGenerator();

		foreach ( $icons as $icon ) {
			$icon_name = $icon['name'] ?? '';
			$content   = $icon['content'] ?? '';

			if ( empty( $icon_name ) || empty( $content ) ) {
				continue;
			}

			$mask_url = $this->svg_to_data_uri( $content );

			if ( empty( $mask_url ) ) {
				continue;
			}

			$selector = $this->get_icon_selector( $icon_name );

			// Generate utility class following WordPress pattern.
			$rule = $generator->generate_utility_class(
				$selector,
				[ '--icon' => $mask_url ],
				true
			);

			$generator->add_rule( $rule );
		}

		return $generator->get_stylesheet();
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
	 * Follows WordPress pattern: .has-{slug}-{property}
	 * Example: .has-icon-pulsar-extensions-arrow-right
	 *
	 * Parses namespaced icon name (e.g., pulsar-extensions/arrow-right)
	 * and converts to CSS class (e.g., .has-icon-pulsar-extensions-arrow-right).
	 *
	 * @param string $icon_name Namespaced icon name (e.g., pulsar-extensions/arrow-right).
	 *
	 * @return string
	 */
	private function get_icon_selector( string $icon_name ): string {
		// Replace slashes with hyphens for CSS class names
		$class_name = str_replace( '/', '-', $icon_name );
		$class_name = sanitize_html_class( $class_name );

		return '.has-icon-' . $class_name;
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
