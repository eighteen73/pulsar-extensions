<?php
/**
 * Icons REST API endpoint.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Api;

use Eighteen73\PulsarExtensions\IconRegistry;
use Eighteen73\PulsarExtensions\Singleton;
use WP_REST_Response;

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
	 * @return bool
	 */
	public function get_icons_permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get all icon sets and their icons.
	 *
	 * @return WP_REST_Response
	 */
	public function get_icons() {
		$icon_sets = IconRegistry::instance()->get_icon_sets();

		return rest_ensure_response( $icon_sets );
	}
}
