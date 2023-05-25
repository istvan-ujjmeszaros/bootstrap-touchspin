const crypto = require("crypto");
module.exports = function (grunt) {
  const distFolder = 'dist/';

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default', ['jshint', 'concat', 'babel', 'uglify', 'cssmin', 'update-license-version']);

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON('package.json'),
    pkg: grunt.file.readJSON('package.json'),

    // Banner definitions
    meta: {
      banner: '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  Made by <%= pkg.author.name %>\n' +
        ' *  Under <%= pkg.license %> License\n' +
        ' */\n'
    },

    // Concat definitions
    concat: {
      js: {
        src: ['src/jquery.bootstrap-touchspin.js'],
        dest: 'dist/jquery.bootstrap-touchspin.js'
      },
      css: {
        src: ['src/jquery.bootstrap-touchspin.css'],
        dest: 'dist/jquery.bootstrap-touchspin.css'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env']
      },
      dist: {
        files: {
          'dist/jquery.bootstrap-touchspin.js': 'dist/jquery.bootstrap-touchspin.js'
        }
      }
    },

    // Lint definitions
    jshint: {
      files: ['src/**/*.js', '__tests__/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Minify definitions
    uglify: {
      js: {
        src: ['dist/jquery.bootstrap-touchspin.js'],
        dest: 'dist/jquery.bootstrap-touchspin.min.js'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    },

    cssmin: {
      css: {
        src: ['dist/jquery.bootstrap-touchspin.css'],
        dest: 'dist/jquery.bootstrap-touchspin.min.css'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    }
  });

  // Clean task for dist folder
  grunt.config('clean', {
    folder: [distFolder + '**/*'],
  });

  grunt.registerTask('update-license-version', 'Update the LICENSE.md file with the current version number', function() {
    const pkg = grunt.config.get('pkg');
    const licenseTemplate = `
MIT License

Bootstrap TouchSpin
v${pkg.version}

A mobile and touch friendly input spinner component for Bootstrap 3 & 4.

    https://github.com/istvan-ujjmeszaros/bootstrap-touchspin
    http://www.virtuosoft.eu/code/bootstrap-touchspin/

Copyright (c) 2013-${new Date().getFullYear()} István Ujj-Mészáros

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

    grunt.file.write('LICENSE.md', licenseTemplate);
  });

  // Checking if the dist folder has been properly rebuilt with "grunt default" before pushing to GitHub
  grunt.registerTask('check-build-integrity', 'Build task with checksum verification', function() {
    const done = this.async();
    const initialChecksum = calculateChecksum(distFolder);

    grunt.log.writeln('Initial checksum:', initialChecksum);

    // Clean dist folder
    grunt.util.spawn({
      cmd: 'grunt',
      args: ['clean'],
      opts: {stdio: 'inherit'}
    }, function(error) {
      if (error) {
        grunt.fail.fatal('Error running "clean" task: ' + error);
      } else {
        grunt.util.spawn({
          cmd: 'grunt',
          args: ['default'],
          opts: {stdio: 'inherit'}
        }, function(error) {
          if (error) {
            grunt.fail.fatal('Error running "default" task: ' + error);
          } else {
            const finalChecksum = calculateChecksum(distFolder);

            grunt.log.writeln('Final checksum:', finalChecksum);

            if (initialChecksum !== finalChecksum) {
              grunt.fail.fatal('Checksums do not match, please rebuild the dist files with "grunt default"!');
            } else {
              grunt.log.ok('Checksums match, the dist folder is up-to-date!');
            }
          }

          done();
        });
      }
    });
  });

  function calculateChecksum(folderPath) {
    const files = grunt.file.expand(folderPath + '**/*');
    const hasher = crypto.createHash('md5');

    files.forEach(function(filePath) {
      if (grunt.file.isFile(filePath)) {
        hasher.update(grunt.file.read(filePath));
      }
    });

    return hasher.digest('hex');
  }

};
