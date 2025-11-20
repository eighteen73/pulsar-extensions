<?php
/**
 * Icons REST API endpoint.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Api;

use Eighteen73\PulsarExtensions\Plugin;
use Eighteen73\PulsarExtensions\Singleton;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Icons API class.
 */
class Icons {

	use Singleton;

	/**
	 * REST API namespace.
	 *
	 * @var string
	 */
	private const NAMESPACE = 'pulsar-extensions/v1';

	/**
	 * REST API route.
	 *
	 * @var string
	 */
	private const ROUTE = '/icons';

	/**
	 * Transient cache key for icons.
	 *
	 * @var string
	 */
	private const CACHE_KEY = 'pulsar_extensions_icons_cache';

	/**
	 * Transient cache expiration (24 hours).
	 *
	 * @var int
	 */
	private const CACHE_EXPIRATION = DAY_IN_SECONDS;

	/**
	 * Setup the class.
	 *
	 * @return void
	 */
	public function setup(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			self::ROUTE,
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_icons' ],
				'permission_callback' => [ $this, 'get_icons_permissions_check' ],
			]
		);
	}

	/**
	 * Check if a given request has access to read icons.
	 *
	 * @return bool|WP_Error
	 */
	public function get_icons_permissions_check() {
		// Only allow authenticated users with edit_posts capability.
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get all icon sets and their icons.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_icons() {
		// Bypass cache in development environments.
		$is_development = Plugin::is_development_mode();

		// Check for cached icons (skip in development).
		if ( ! $is_development ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( false !== $cached && is_array( $cached ) ) {
				return rest_ensure_response( $cached );
			}
		}

		$icon_sets = $this->get_icon_sets();

		if ( is_wp_error( $icon_sets ) ) {
			return $icon_sets;
		}

		// Cache the results (skip in development).
		if ( ! $is_development ) {
			set_transient( self::CACHE_KEY, $icon_sets, self::CACHE_EXPIRATION );
		}

		return rest_ensure_response( $icon_sets );
	}

	/**
	 * Scan the assets/icons directory for icon sets.
	 *
	 * @return array<int, array<string, mixed>>|WP_Error Array of icon sets or WP_Error on failure.
	 */
	private function get_icon_sets() {
		$icons_path = PULSAR_EXTENSIONS_PATH . 'assets/icons/';

		// Check if icons directory exists.
		if ( ! is_dir( $icons_path ) ) {
			return new WP_Error(
				'icons_directory_not_found',
				__( 'Icons directory not found.', 'pulsar-extensions' ),
				[ 'status' => 404 ]
			);
		}

		$icon_sets = [];

		// Scan for icon set directories.
		$icon_set_dirs = glob( $icons_path . '*', GLOB_ONLYDIR );
		if ( false === $icon_set_dirs || empty( $icon_set_dirs ) ) {
			return [];
		}

		foreach ( $icon_set_dirs as $icon_set_dir ) {
			$icon_set_name = basename( $icon_set_dir );
			$icons         = $this->get_icons_in_set( $icon_set_dir );

			// Only include icon sets that have icons.
			if ( ! empty( $icons ) ) {
				$icon_sets[] = [
					'name'  => $icon_set_name,
					'label' => $this->format_label( $icon_set_name ),
					'icons' => $icons,
				];
			}
		}

		return $icon_sets;
	}

	/**
	 * Scan an icon set directory for SVG files.
	 *
	 * @param string $icon_set_path Path to the icon set directory.
	 *
	 * @return array<int, array<string, string>> Array of icons.
	 */
	private function get_icons_in_set( string $icon_set_path ): array {
		$icons = [];

		// Find all SVG files in the icon set directory.
		$svg_files = glob( $icon_set_path . '/*.svg' );
		if ( false === $svg_files ) {
			return $icons;
		}

		foreach ( $svg_files as $svg_file ) {
			$icon_name = basename( $svg_file, '.svg' );

			// Get the SVG source content.
			$svg_source = $this->get_svg_source( $svg_file );
			if ( ! empty( $svg_source ) ) {
				$icons[] = [
					'name'   => $icon_name,
					'label'  => $this->format_label( $icon_name ),
					'source' => $svg_source,
				];
			}
		}

		return $icons;
	}

	/**
	 * Get the SVG source content from a file.
	 *
	 * @todo - Pulsar has a more robust way of doing this.
	 *
	 * @param string $svg_file Path to the SVG file.
	 *
	 * @return string SVG content or empty string on failure.
	 */
	private function get_svg_source( string $svg_file ): string {
		if ( ! file_exists( $svg_file ) || ! is_readable( $svg_file ) ) {
			return '';
		}

		// Read the file contents.
		$svg_content = file_get_contents( $svg_file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $svg_content ) {
			return '';
		}

		// Basic validation to ensure it's an SVG.
		if ( ! str_contains( $svg_content, '<svg' ) ) {
			return '';
		}

		return trim( $svg_content );
	}

	/**
	 * Format a filename or directory name to title case.
	 *
	 * Converts hyphens to spaces and capitalizes each word.
	 *
	 * @param string $name The name to format.
	 *
	 * @return string Formatted label.
	 */
	private function format_label( string $name ): string {
		// Replace hyphens with spaces.
		$label = str_replace( '-', ' ', $name );

		// Convert to title case.
		return ucwords( $label );
	}

	/**
	 * Clear the icons cache.
	 *
	 * Useful for development or after adding new icons.
	 *
	 * @return bool True if the cache was cleared, false otherwise.
	 */
	public function clear_icons_cache(): bool {
		return delete_transient( self::CACHE_KEY );
	}
}
