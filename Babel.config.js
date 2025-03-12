module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo",],
      
    ],
    // esto se insto para react-native-paper
    env: {
      production: {
        plugins: ['react-native-paper/babel',
          
        ],

      },
    },
  };
};