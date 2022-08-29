
module.exports = function (modules) {
  const plugins = [
    [
      require.resolve('@babel/plugin-transform-typescript'),
      {
        isTSX: true,
      },
    ],
    require.resolve('@babel/plugin-transform-object-assign'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        useESModules: modules === false,
        version: '^7.10.4',
      },
    ],
    [
      require.resolve('@babel/plugin-proposal-decorators'),
      {
        legacy: true,
      },
    ],
    require.resolve('@babel/plugin-proposal-class-properties'),
  ];
  return {
    presets: [
      require.resolve('@babel/preset-react'),
      [
        require.resolve('@babel/preset-env'),
        {
          modules,
          targets: {
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
          },
        },
      ],
    ],
    plugins,
  };
};
