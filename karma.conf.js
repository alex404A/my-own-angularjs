module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine'],
    files: [
      'src/**/*.js',
      'test/**/*_spec.js'
    ],
    preprocessors: {
      'test/**/*.js': ['jshint', 'browserify'],
      'src/**/*.js': ['jshint', 'browserify']
    },
    //logLevel: 'LOG_DEBUG',
    browsers: ['PhantomJS'],
    browserify: {
      debug: true,
      bundleDelay: 2000
    }
  })
}
