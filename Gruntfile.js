// Imports.
var timeGrunt = require('time-grunt');

// Exports.
module.exports = function(grunt) {
  // Monitor.
  timeGrunt(grunt);

  // Project configuration.
  grunt.initConfig({
    // Audit.
    jshint: {
      options : { jshintrc: true },
      all     : [ 'Gruntfile.js', 'lib/*.js', 'tasks/*.js', 'test/*.js' ]
    },

    // Clean.
    clean: { all: '.tmp/' },

    // Sprockets Directives (for testing).
    directives: {
      options : { cwd: 'test/fixtures' },
      all     : {
        src  : 'test/fixtures/main.js',
        dest : '.tmp/out.js'
      }
    },

    // Tests.
    nodeunit: { all: 'test/*.test.js' }
  });

  // Load tasks.
  [
    'grunt-contrib-clean',
    'grunt-contrib-jshint',
    'grunt-contrib-nodeunit'
  ].forEach(grunt.loadNpmTasks);
  grunt.loadTasks('tasks');

  // Tasks.
  grunt.registerTask('test',    [ 'clean', 'directives', 'nodeunit' ]);
  grunt.registerTask('default', [ 'jshint', 'test' ]);
};