// Imports.
var path     = require('path');
var Resource = require('../lib/resource.js');

// Exports.
module.exports = function(grunt) {
  // Task description.
  var description = 'Dependency management using Sprockets directives.';

  // Load tasks. Avoid using `grunt.loadNpmTasks` as this will try to load the
  // module relative to the projects `Gruntfile.js`.
  var modulePath = path.dirname(require.resolve('grunt-contrib-concat'));
  var taskPath   = path.join(modulePath, 'tasks');
  grunt.loadTasks(taskPath);

  // Register directives task.
  grunt.registerMultiTask('directives', description, function() {
    // Iterate over all specified file groups.
    var self = this;
    this.files.forEach(function(f) {
      // Verify arguments.
      if(1 !== f.src.length) {
        grunt.log.warn('Only one file can be stripped at a time.');
        return;
      }

      // Extract `src`.
      var filepath = f.src.shift();
      if(!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
        return;
      }

      // Cast arguments.
      var options = self.options({ cwd: path.dirname(filepath) });

      // Compile.
      var resource = new Resource(filepath, { cwd: options.cwd });
      var depChain = resource.depChain();

      // Trigger consequent tasks.
      grunt.config.set('concat.directives', {
        options : options,
        src     : depChain,
        dest    : f.dest,
        nonull  : options.nonull
      });
      grunt.config.set('stripDirectives.directives', { src: f.dest });
      grunt.task.run([ 'concat:directives', 'stripDirectives:directives' ]);
    });
  });

  // Register strip directives task.
  grunt.registerMultiTask('stripDirectives', description, function() {
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Verify arguments.
      if(1 !== f.src.length) {
        grunt.log.warn('Only one file can be stripped at a time.');
        return;
      }

      // Extract `src`.
      var filepath = f.src.shift();
      if(!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
        return;
      }

      // Strip and save.
      var resource = new Resource(filepath);
      var dest     = f.dest || filepath;
      grunt.file.write(dest, resource.stripContents());

      // Print a success message.
      grunt.log.writeln('File "' + dest + '" created.');
    });
  });
};