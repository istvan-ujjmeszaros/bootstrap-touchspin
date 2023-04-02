const crypto = require("crypto");
module.exports = function (grunt) {
  const distFolder = 'dist/';

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON('package.json'),

    // Banner definitions
    meta: {
      banner: '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  Made by <%= pkg.author.name %>\n' +
        ' *  Under <%= pkg.licenses[0].type %> License\n' +
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
    dist: {
      files: [{
        dot: true,
        src: ['dist/**/*']
      }]
    }
  });

  grunt.registerTask('build-checksum', 'Build task with checksum verification', function() {
    const done = this.async();
    const initialChecksum = calculateChecksum(distFolder);

    grunt.log.writeln('Initial checksum:', initialChecksum);

    // Clean dist folder
    grunt.task.run('clean:dist');

    // Rebuild files asynchronously
    grunt.util.spawn({
      cmd: 'grunt',
      args: ['default'],
      opts: {stdio: 'inherit'}
    }, function(error, result, code) {
      if (error) {
        grunt.fail.fatal('Error running "default" task: ' + error);
      } else {
        const finalChecksum = calculateChecksum(distFolder);

        grunt.log.writeln('Final checksum:', finalChecksum);

        if (initialChecksum !== finalChecksum) {
          grunt.fail.fatal('Checksums do not match!');
        } else {
          grunt.log.ok('Checksums match!');
        }
      }

      done();
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

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);
};
