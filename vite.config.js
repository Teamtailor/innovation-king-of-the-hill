export default {
  base: './',
  // Phaser 3.22's package "main" is raw webpack-flavoured source; use its prebuilt bundle.
  resolve: { alias: { phaser: 'phaser/dist/phaser.js' } },
  build: { chunkSizeWarningLimit: 2000 }
};
