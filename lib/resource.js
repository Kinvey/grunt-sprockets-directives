// Imports.
var grunt = require('grunt');
var path  = require('path');

/**
 * File resource.
 *
 * @param {string} filepath File path.
 * @param {Object} options  Options.
 */
var Resource = function(filepath, options) {
  // Cast arguments.
  options = options || { };

  // Extract options.
  this.cwd   = path.resolve(options.cwd || './');
  this.stubs = options.stubs || [ ];
  this.type  = options.type  || 'index';

  // Path.
  this.path     = path.resolve(filepath);
  this.contents = grunt.file.read(this.path);
  this.deps     = [ ];
};

// Define constants.
Resource.HEADER_PATTERN = new RegExp(
'^(?:\\s*' +
  '(' +
    '(?:\/[*](?:\\s*|.+?)*?[*]\/)' + '|' +
    '(?:\/\/.*\n?)+' + '|' +
    '(?:#.*\n?)+' +
  ')*' +
')*', 'm');
Resource.DIRECTIVE_PATTERN = /^\W*=\s*(\w+.*?)(\*\/)?$/;
Resource.TYPE_PATTERN      = /(\w+)(?:\s+(["']?)(.*)\2)?/;

// Define methods.
Resource.prototype = {
  /**
   * Returns the dependency chain for this resource.
   *
   * @param {Array} [stack]        Array of resources to resolve.
   * @param {Array} [alreadyAdded] List of already added resources.
   * @return {Array}
   */
  depChain: function(stack, alreadyAdded) {
    // Cast arguments.
    alreadyAdded = alreadyAdded || [ ];
    stack        = stack || [ this.depTree() ];

    // Loop through stack and return the dependency chain.
    var self = this;
    return stack.reduce(function(prev, current) {
      // Skip if the resource is already included, or is stubbed.
      if(-1 !== self.stubs.indexOf(current.path) ||
       ('include' !== current.type && -1 !== alreadyAdded.indexOf(current.path))) {
        return prev;
      }

      // Add resource if prioritized.
      if('require_self' === current.type) {
        prev.push(current.path);
      }
      prev = prev.concat(self.depChain(current.deps, prev));// Add dependencies.

      // Add resource if not already included.
      if('include' === current.type || -1 === prev.indexOf(current.path)) {
        prev.push(current.path);
      }
      return prev;
    }, [ ]);
  },

  /**
   * Returns the resource with all its dependencies.
   *
   * @param {Array}  [alreadyAdded] List of already added resources.
   * @param {string} [parent]       Parent resource path.
   * @returns {Resource}
   */
  depTree: function(alreadyAdded, parent) {
    // Cast arguments.
    alreadyAdded = alreadyAdded || [ ];
    if(-1 !== alreadyAdded.indexOf(this.path)) {
      // Circular reference detected.
      var from = parent.substr(this.cwd.length + 1);
      var to   = this.path.substr(this.cwd.length + 1);
      grunt.log.warn('Circular reference from "' + from + '" to "' + to + '" ignored.');
      return false;
    }
    alreadyAdded.push(this.path);// Update.

    // Assign dependency tree.
    var self  = this;
    self.deps = this.parseDirectives().reduce(function(prev, current) {
      // Edge-case: handle require_self.
      if(current.path === self.path) {
        self.type = current.type;
        return prev;
      }

      // Resolve and add child dependencies.
      var resource = new Resource(current.path, {
        cwd   : self.cwd,
        stubs : self.stubs,
        type  : current.type
      });
      var deps = resource.depTree(alreadyAdded.slice(), self.path);
      if(false !== deps) {
        prev.push(deps);
      }
      return prev;
    }, [ ]);
    return this;
  },

  /**
   * Returns an array of all Sprockets directives in this resource.
   *
   * @returns {Array}
   */
  parse: function() {
    var result = [ ];// Init.

    // Match header.
    var header = (Resource.HEADER_PATTERN.exec(this.contents) || []).shift() || '';
    header.split(/\r?\n/).forEach(function(line) {
      // Match directives on header line.
      var match;
      if(null !== (match = Resource.DIRECTIVE_PATTERN.exec(line))) {
        result.push(match[1].trim());
      }
    });
    return result;
  },

  /**
   * Returns an array of dependencies of this resource.
   *
   * @returns {Array}
   */
  parseDirectives: function() {
    var result = [ ]; // Init.
    var self   = this;

    // Parse directives.
    var directives = this.parse();
    directives.forEach(function(directive) {
      // Extract directive type and resource.
      directive = directive.match(Resource.TYPE_PATTERN);
      var type     = directive[1];
      var resource = directive[3];

      // Handle directive.
      var filepath;
      switch(type) {
        case 'include':
        case 'require':
          if(false !== (filepath = self.resolve(resource))) {
            result.push({
              type : type,
              path : filepath
            });
          }
          break;

        case 'require_self':
          result.push({
            type : type,
            path : self.path
          });
          break;

        case 'require_directory':
          self.pathsInDir(resource).forEach(function(r) {
            var filepath = path.join(resource, r);
            result.push({
              type : type,
              path : self.resolve(filepath)
            });
          });
          break;

        case 'require_tree':
          self.pathsInTree(resource).forEach(function(r) {
            var filepath = path.join(resource, r);
            result.push({
              type : type,
              path : self.resolve(filepath)
            });
          });
          break;

        case 'stub':
          if(false !== (filepath = self.resolve(resource))) {
            self.stubs.push(filepath);
          }
          break;
      }
    });
    return result;
  },

  /**
   * Returns an array of paths of all files in the specified directory.
   *
   * @param {string} dir Directory.
   * @returns {Array}
   */
  pathsInDir: function(dir) {
    var base = grunt.file.isPathAbsolute(dir) ? this.cwd : path.dirname(this.path);
    var cwd  = path.join(base, dir);
    return grunt.file.expand({
      cwd    : cwd,
      filter : grunt.file.isFile
    }, '*');
  },

  /**
   * Returns an array of paths of all files in the specified directory tree.
   *
   * @param {string} dir Directory.
   * @returns {Array}
   */
  pathsInTree: function(dir) {
    var base = grunt.file.isPathAbsolute(dir) ? this.cwd : path.dirname(this.path);
    var cwd  = path.join(base, dir);
    return grunt.file.expand({
      cwd    : cwd,
      filter : grunt.file.isFile
    }, '**/*');
  },

  /**
   * Resolves a relative path to an absolute path.
   *
   * @param {string} filepath File path.
   * @returns {string}
   */
  resolve: function(filepath) {
    // Cast arguments.
    var base = grunt.file.isPathAbsolute(filepath) ? this.cwd : path.dirname(this.path);
    filepath = path.join(base, filepath);

    // Add extension.
    if('' === path.extname(filepath)) {
      filepath += '.js';
    }

    // Verify.
    if(!grunt.file.isFile(filepath)) {
      grunt.log.warn('Source file "' + filepath + '" not found.');
      return false;
    }
    return filepath;
  },

  /**
   * Returns the resource contents with directives stripped.
   *
   * @return {string}
   */
  stripContents: function() {
    // Match lines.
    var result = this.contents;// Init.
    this.contents.split(/\r?\n/).forEach(function(line) {
      // Match directives on header line.
      var match;
      if(null !== (match = Resource.DIRECTIVE_PATTERN.exec(line))) {
        result = result.replace(match[0], '');
      }
    });
    return result;
  },

  /**
   * Returns JSON representation of this resource.
   *
   * @returns {Object}
   */
  toJSON: function() {
    return {
      type     : this.type,
      path     : this.path,
      contents : this.contents,
      deps     : this.deps
    };
  }
};

// Exports.
module.exports = Resource;