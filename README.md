# grunt-sprockets-directives
> Dependency management using Sprockets directives.

## Getting Started
This plugin requires Grunt `~0.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-sprockets-directives --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-sprockets-directives');
```

## Sprockets Directives
You can use the following directives to declare dependencies in asset source files.

For directives that take a *path* argument, you may specify either a logical path or a relative path. Relative paths begin with `./` and reference files relative to the location of the current file.

### The `require` Directive
`require` *path* inserts the contents of the asset source file specified by *path*. If the file is required multiple times, it will appear in the bundle only once.

### The `include` Directive
`include` *path* works like `require`, but inserts the contents of the specified source file even if it has already been included or required.

### The `require_directory` Directive
`require_directory` *path* requires all source files of the same format in the directory specified by *path*. Files are required in alphabetical order.

### The `require_tree` Directive
`require_tree` *path* works like `require_directory`, but operates recursively to require all files in all subdirectories of the directory specified by *path*.

### The `require_self` Directive
`require_self` tells Sprockets to insert the body of the current source file before any subsequent `require` or `include` directives.

### The `stub` Directive
`stub` *path* allows dependency to be excluded from the asset bundle. The *path* must be a valid asset and may or may not already be part of the bundle. Once stubbed, it is blacklisted and can't be brought back by any other `require`.

## The "directives" task

### Overview
In your project's Gruntfile, add a section named `directives` to the data object passed into `grunt.initConfig()`. Only **one** `src` file is allowed per target.

```js
grunt.initConfig({
  directives: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options
This task will resolve all dependencies, concatenate files using Grunt [concat](https://github.com/gruntjs/grunt-contrib-concat). Aside from the options outlined below, all [concat options](https://github.com/gruntjs/grunt-contrib-concat#options) are accepted as well.

#### options.cwd
Type: `String`
Default value: `<cwd of your_target.src>`

Relative dependencies will be matched relative to this path.

### Usage Examples

#### Default Options
In this example, the default options are used to resolve dependencies. All dependencies are concatenated using [concats](https://github.com/gruntjs/grunt-contrib-concat#options) default options.

```js
grunt.initConfig({
  directives: {
    files: { 'dest/output': 'src/input' },
  },
});
```

#### Custom Options
In this example, custom options are used to resolve dependencies. The relative path for all dependencies is `src`. When concatenating, an `intro.txt` and `outro.txt` are added.

```js
grunt.initConfig({
  directives: {
    options: {
      banner : grunt.file.read('intro.txt'),
      footer : grunt.file.read('outro.txt')
    },
    files: {
      options : { cwd: './src' },
      src     : 'src/input',
      dest    : 'dest/output'
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
** 0.1.0 (February 20, 2014)

  * Initial version.

## Credits
This project is heavily based on [sprockets](https://github.com/sstephenson/sprockets) and [sprockets-chain](https://github.com/lucaong/sprockets-chain).

## License
    Copyright 2014 Kinvey, Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.