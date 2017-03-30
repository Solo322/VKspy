export function initialize( application ) {
  application.inject('component', 'vkUsers', 'service:vk-users');
}

export default {
  name: 'vk-users',
  initialize
};
