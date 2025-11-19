<?php
/**
 * Main plugin class.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions;

defined( 'ABSPATH' ) || exit;

/**
 * Main Plugin class.
 */
class Plugin {

	use Singleton;

	/**
	 * Transient cache key for extensions.
	 *
	 * @var string
	 */
	private const CACHE_KEY = 'pulsar_extensions_cache';

	/**
	 * Transient cache expiration (24 hours).
	 *
	 * @var int
	 */
	private const CACHE_EXPIRATION = DAY_IN_SECONDS;

	/**
	 * Setup the plugin.
	 *
	 * @return void
	 */
	public function setup(): void {
		add_action( 'init', [ $this, 'load_textdomain' ] );
		add_action( 'init', [ $this, 'register_block_styles' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_scripts' ] );
		add_action( 'enqueue_block_assets', [ $this, 'enqueue_editor_styles' ] );
	}

	/**
	 * Load plugin textdomain.
	 *
	 * @return void
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain(
			'pulsar-extensions',
			false,
			PULSAR_EXTENSIONS_PATH . '/languages'
		);
	}

	/**
	 * Plugin activation.
	 *
	 * @return void
	 */
	public static function activation(): void {
		delete_transient( self::CACHE_KEY );
	}

	/**
	 * Plugin deactivation.
	 *
	 * @return void
	 */
	public static function deactivation(): void {
		delete_transient( self::CACHE_KEY );
	}

	/**
	 * Discover all available extensions from the build directory.
	 *
	 * @return array<string, array<string>> Array of block names with their extensions.
	 */
	private function get_available_extensions(): array {
		// Check for cached extensions.
		$cached = get_transient( self::CACHE_KEY );
		if ( false !== $cached && is_array( $cached ) ) {
			return $cached;
		}

		$extensions = [];
		$build_path = PULSAR_EXTENSIONS_PATH . 'build/';

		// Check if build directory exists.
		if ( ! is_dir( $build_path ) ) {
			return $extensions;
		}

		// Scan for block directories.
		$block_dirs = glob( $build_path . '*', GLOB_ONLYDIR );
		if ( false === $block_dirs ) {
			return $extensions;
		}

		foreach ( $block_dirs as $block_dir ) {
			$block_name                = basename( $block_dir );
			$extensions[ $block_name ] = [];

			// Find all .asset.php files in the block directory.
			$asset_files = glob( $block_dir . '/*.asset.php' );
			if ( false === $asset_files ) {
				continue;
			}

			foreach ( $asset_files as $asset_file ) {
				$extension_name              = basename( $asset_file, '.asset.php' );
				$extensions[ $block_name ][] = $extension_name;
			}
		}

		// Cache the results.
		set_transient( self::CACHE_KEY, $extensions, self::CACHE_EXPIRATION );

		return $extensions;
	}

	/**
	 * Get enabled extensions after applying filters.
	 *
	 * @return array<string, array<string>> Filtered array of block names with their extensions.
	 */
	private function get_enabled_extensions(): array {
		$available_extensions = $this->get_available_extensions();
		$enabled_extensions   = [];

		foreach ( $available_extensions as $block => $extensions ) {
			/**
			 * Filter the extensions to load for a specific block.
			 *
			 * @param array<string> $extensions Array of extension names.
			 *
			 * @return array<string> Filtered array of extension names to load.
			 */
			$filtered_extensions = apply_filters( "pulsar_extensions_{$block}", $extensions );

			// Ensure the filter returns an array.
			if ( is_array( $filtered_extensions ) && ! empty( $filtered_extensions ) ) {
				$enabled_extensions[ $block ] = $filtered_extensions;
			}
		}

		return $enabled_extensions;
	}

	/**
	 * Get the block name for a given folder name.
	 *
	 * @param string $folder The folder name (e.g., 'group', 'column').
	 *
	 * @return string The full block name (e.g., 'core/group').
	 */
	private function get_block_name_for_folder( string $folder ): string {
		$default_map = [
			'column'  => 'core/column',
			'columns' => 'core/columns',
			'group'   => 'core/group',
		];

		/**
		 * Filter the block name mapping.
		 *
		 * Allows themes and plugins to add custom block mappings for third-party blocks.
		 *
		 * @param array<string, string> $map Array of folder names to block names.
		 *
		 * @return array<string, string> Filtered array of folder names to block names.
		 */
		$map = apply_filters( 'pulsar_extensions_block_name_map', $default_map );

		return $map[ $folder ] ?? "core/{$folder}";
	}

	/**
	 * Enqueue editor scripts.
	 *
	 * @return void
	 */
	public function enqueue_editor_scripts(): void {
		$enabled_extensions = $this->get_enabled_extensions();

		foreach ( $enabled_extensions as $block => $extensions ) {
			foreach ( $extensions as $extension ) {
				$asset_path  = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}.asset.php";
				$script_path = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}.js";

				// Check if asset file exists.
				if ( ! file_exists( $asset_path ) || ! file_exists( $script_path ) ) {
					continue;
				}

				// Load asset file.
				$asset = require $asset_path;

				// Enqueue script.
				$script_handle = "pulsar-extensions-{$block}-{$extension}";
				wp_enqueue_script(
					$script_handle,
					PULSAR_EXTENSIONS_URL . "build/{$block}/{$extension}.js",
					$asset['dependencies'] ?? [],
					$asset['version'],
					[
						'in_footer' => true,
					]
				);
			}
		}
	}

	/**
	 * Enqueue editor-only styles.
	 *
	 * Uses enqueue_block_assets to ensure styles load inside the block editor iframe.
	 *
	 * @return void
	 */
	public function enqueue_editor_styles(): void {

		// Only run in the admin block editor context.
		if ( ! is_admin() ) {
			return;
		}

		$enabled_extensions = $this->get_enabled_extensions();

		foreach ( $enabled_extensions as $block => $extensions ) {
			foreach ( $extensions as $extension ) {
				$asset_path     = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}.asset.php";
				$style_path     = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}.css";
				$style_rtl_path = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}-rtl.css";

				if ( ! file_exists( $style_path ) ) {
					continue;
				}

				$version = filemtime( $style_path );

				if ( file_exists( $asset_path ) ) {
					$asset   = require $asset_path;
					$version = $asset['version'] ?? $version;
				}

				$style_handle = "pulsar-extensions-{$block}-{$extension}-editor";

				wp_enqueue_style(
					$style_handle,
					PULSAR_EXTENSIONS_URL . "build/{$block}/{$extension}.css",
					[],
					$version
				);

				if ( file_exists( $style_rtl_path ) ) {
					wp_style_add_data( $style_handle, 'rtl', 'replace' );
				}
			}
		}
	}

	/**
	 * Register front-end block styles.
	 *
	 * Uses wp_enqueue_block_style() to conditionally load styles only when the block is present.
	 *
	 * @return void
	 */
	public function register_block_styles(): void {
		$enabled_extensions = $this->get_enabled_extensions();

		foreach ( $enabled_extensions as $block => $extensions ) {
			$block_name = $this->get_block_name_for_folder( $block );

			foreach ( $extensions as $extension ) {
				$style_path = PULSAR_EXTENSIONS_PATH . "build/{$block}/style-{$extension}.css";

				// Only register if the front-end style file exists.
				if ( ! file_exists( $style_path ) ) {
					continue;
				}

				// Get asset version.
				$asset_path = PULSAR_EXTENSIONS_PATH . "build/{$block}/{$extension}.asset.php";
				if ( file_exists( $asset_path ) ) {
					$asset   = require $asset_path;
					$version = $asset['version'];
				}

				$style_handle = "pulsar-extensions-{$block}-{$extension}-style";

				// Register the style.
				wp_enqueue_block_style(
					$block_name,
					[
						'handle' => $style_handle,
						'src'    => PULSAR_EXTENSIONS_URL . "build/{$block}/style-{$extension}.css",
						'path'   => $style_path,
						'ver'    => $version,
					]
				);

				// WordPress automatically handles RTL when 'path' is provided.
				// The RTL file will be loaded automatically if it exists.
			}
		}
	}

	/**
	 * Clear the extensions cache.
	 *
	 * Useful for development or after plugin updates.
	 *
	 * @return bool True if the cache was cleared, false otherwise.
	 */
	public function clear_extensions_cache(): bool {
		return delete_transient( self::CACHE_KEY );
	}
}
