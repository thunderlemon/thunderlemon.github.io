let gulp         = require('gulp'),
    imagemin     = require('gulp-imagemin'),
    include      = require('gulp-include'),
    plumber      = require('gulp-plumber'),
    browserSync  = require('browser-sync'),
    spawn        = require('cross-spawn');

/**
 * Notify
 *
 * Show a notification in the browser's corner.
 *
 * @param {*} message
 */
function notify(message) {
  browserSync.notify(message);
}

/**
 * Config Task
 *
 * Build the main YAML config file.
 */
function config() {
  return gulp.src('src/yml/_config.yml')
    .pipe(include())
    .on('error', console.error)
    .pipe(gulp.dest('./'));
}

/**
 * Jekyll Task
 *
 * Build the Jekyll Site.
 *
 * @param {*} done
 */
function jekyll(done) {
  notify('Building Jekyll...');
  return require('child_process').exec('bundle exec jekyll build');
}

/**
 * Server Task
 *
 * Launch server using BrowserSync.
 *
 * @param {*} done
 */
function server(done) {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
  done();
}

/**
 * Reload Task
 *
 * Reload page with BrowserSync.
 *
 * @param {*} done
 */
function reload(done) {
  notify('Reloading...');
  browserSync.reload();
  done();
}

/**
 * JS assets Task
 *
 * Copy JS files to the assets folder.
 */
function jsAssets() {
  notify('Copying js files...');
  return gulp.src('src/js/**/*.*')
    .pipe(gulp.dest('assets/js/'));
}

/**
 * CSS assets Task
 *
 * Copy CSS files to the assets folder.
 */
function cssAssets() {
  notify('Copying css files...');
  return gulp.src('src/css/**/*.*')
    .pipe(gulp.dest('assets/css/'));
}

/**
 * Font assets Task
 *
 * Copy font files to the assets folder.
 */
function fontAssets() {
  notify('Copying font files...');
  return gulp.src('src/fonts/**/*.*')
    .pipe(gulp.dest('assets/fonts/'));
}

/**
 * Images Task
 *
 * All images are optimized and copied to assets folder.
 */
function images() {
  notify('Copying image files...');
  return gulp.src('src/img/**/*.{jpg,png,gif,svg}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'));
}

/**
 * Watch Task
 *
 * Watch files to run proper tasks.
 */
function watch() {
  // Watch YAML files for changes & recompile
  gulp.watch(['src/yml/*.yml'], gulp.series(config, jekyll, reload));

  // Watch SASS files for changes & rebuild styles
  gulp.watch(['_sass/**/*.scss'], gulp.series(jekyll, reload));

  // Watch JS files for changes, copy files & reload
  gulp.watch('src/js/**/*.js', gulp.series(jsAssets, reload));

  // Watch CSS files for changes, copy files & reload
  gulp.watch('src/css/**/*.js', gulp.series(cssAssets, reload));

  // Watch font files for changes, copy files & reload
  gulp.watch('src/fonts/**/*.js', gulp.series(fontAssets, reload));

  // Watch images for changes, optimize & recompile
  gulp.watch('src/img/**/*', gulp.series(images, config, jekyll, reload));

  // Watch html/md files, rebuild config, run Jekyll & reload BrowserSync
  gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html'], gulp.series(config, jekyll, reload));
}

/**
 * Default Task
 *
 * Running just `gulp` will:
 * - Compile the SASS and JavaScript files
 * - Optimize and copy images to its folder
 * - Build the config file
 * - Compile the Jekyll site
 * - Launch BrowserSync & watch files
 */
exports.default = gulp.series(gulp.parallel(jsAssets, cssAssets, fontAssets, images), config, jekyll, gulp.parallel(server, watch));

/**
 * Build Task
 *
 * Running just `gulp build` will:
 * - Compile the SASS and JavaScript files
 * - Optimize and copy images to its folder
 * - Build the config file
 * - Compile the Jekyll site
 */
exports.build = gulp.series(gulp.parallel(jsAssets, cssAssets, fontAssets, images), config, jekyll);
