export function initialize( application) {
	application.inject('component', 'imRoute', 'route:im');
}

export default {
  name: 'im-route',
  initialize
};
