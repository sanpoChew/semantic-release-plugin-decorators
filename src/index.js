const { isFunction, isPlainObject, negate } = require('lodash');
const importFrom = require('import-from');

const pluginsFromTypeConfig = config =>
  []
    .concat((config && config.path) || config)
    .filter(negate(isPlainObject))
    .filter(Boolean)
    .map(
      value => (isFunction(value) ? value : importFrom(process.cwd(), value))
    );

const pluginFromTypeConfig = (config, type, index = 0) =>
  pluginsFromTypeConfig(config, type)[index];

const wrapPlugin = (namespace, type, fn) => {
  return async (pluginConfig, config) => {
    const { [namespace]: { [type]: typeConfig } = {} } = pluginConfig;
    const plugin = pluginFromTypeConfig(typeConfig, type);

    return await fn(plugin)(
      {
        ...pluginConfig,
        ...(isPlainObject(typeConfig) ? typeConfig : undefined),
      },
      config
    );
  };
};

module.exports = {
  pluginFromTypeConfig,
  pluginsFromTypeConfig,
  wrapPlugin,
};