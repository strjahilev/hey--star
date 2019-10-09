let gulp = require('gulp');
let sass = require('gulp-sass');
let autoPreFixer = require('gulp-autoprefixer');
let rename = require('gulp-rename');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let imageMin = require('gulp-imagemin');
let minifyInline = require('gulp-minify-inline');
let minifyCSS = require('gulp-minify-css');
let browserSync = require('browser-sync');
let cashe = require('gulp-cache');
let del = require('del');





// convert csss files to css and minify and create autoprefixes for different browsers and
gulp.task('scssTocss',   function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass({
            errorLogToConsole: true
        }).on('error', console.error.bind(console)))
        .pipe(autoPreFixer(['last 15 versions','ie 8', 'ie 7'], {cascade:true}))
        .pipe(gulp.dest('src/css'))
        .pipe(minifyCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('src/css'))
});
//concat all JS files to one, next compress and rename
gulp.task('compressJs', function () {
    return gulp.src('src/**/*.js')
        .pipe(concat('../js/all-common.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('src/js')
        )
});
//minify jQuery lib's file
gulp.task('scripts', async function (){
    return gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(prettify({indent_char: '', indent_size: 2}))
        .pipe(gulp.dest('src/js'))
});
//minify image files
gulp.task('img', async function () {
    return gulp.src('src/img/**/*')
        .pipe(cashe(imageMin([
            imageMin.gifsicle({interlaced: true}),
            imageMin.jpegtran({progressive: true}),
            imageMin.optipng({optimizationLevel: 5}),
            imageMin.svgo({
                plugins:{removeViewBox: true}
            }),
        ])))
        .pipe(gulp.dest('dist/img'))
});
// minify Html files
gulp.task('minifyHtml', async function() {
    gulp.src('src/*.html')
        .pipe(minifyInline())
        .pipe(gulp.dest('dist/'))
});

//listen server, start
gulp.task('browser', function () {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    })
});
//------------------------------------------------------------------
//watching all changes in files. It's for create project
gulp.task('watch', async function () {
    gulp.watch('src/scss/**/*.scss', gulp.parallel('scssTocss'));
    gulp.watch('src/*.html', gulp.parallel('minifyHtml'));
    // gulp.watch('src/**/*.js', gulp.parallel('compressJs'));
    gulp.watch('src/**/*.html').on('change', browserSync.reload);
    gulp.watch('src/css/**/*.css').on('change', browserSync.reload);
    // gulp.watch('src/**/*.js').on('change', browserSync.reload);

    // gulp.watch('src/js/**/*.js').on('change', browserSync.reload)

});
//-------------------------------------------------------------
gulp.task ( 'default', gulp.parallel('browser', 'scssTocss', 'compressJs', 'minifyHtml','watch' ));
//------------------------------------------------------------------------------------------
// очистка перед сборкой проэкта
gulp.task('clean', async function () {
    return del.sync('dist')
});
//очиска кэша при оптимизации картинок
gulp.task('clear', function () {
    return cashe.clearAll()
});


gulp.task('construct', async function () {
    let buildCss = gulp.src(
        'src/css/main.min.css'
    )
        .pipe(gulp.dest('dist/css'));
    let buildFonts = gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
    let buildJs= gulp.src('src/js/*')
        .pipe(gulp.dest('dist/js'));
    // let buildHtml = gulp.src('src/*.html')
    //     .pipe(minifyInline())
    //     .pipe(gulp.dest('dist'))
    //     .pipe(gulp.dest('dist'));
});

//полная сборка проэкта
gulp.task('build', gulp.parallel('clean', 'img','scssTocss', 'minifyHtml','compressJs','scripts', 'construct'));
//запуск сервера для просмотра всех изменений на стадии разработки

