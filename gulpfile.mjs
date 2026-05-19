import gulp from 'gulp';
const { series, src, dest } = gulp;
// 各プラグイン読み込み
import { existsSync } from 'node:fs';
import { deleteAsync } from 'del'; // 削除
import imagemin, {mozjpeg, svgo} from 'gulp-imagemin'; // 画像の圧縮
import pngquant from 'imagemin-pngquant'; // PNG画像はこのプラグインが軽量化率高い

// パス設定 ====================================
const srcPath = {
  img: './src/**/*',
}
const destPath = {
  img: './dest/',
}

// destディレクトリ内のファイルを削除 ============
const Clean = async () => {
  await deleteAsync([`${destPath.img}/**`, `!${destPath.img}`]);
};

// 画像圧縮 ====================================
const ImgImagemin = () => {
  if (!existsSync('./src')) {
    return Promise.resolve();
  }

  return src(srcPath.img, {encoding: false, allowEmpty: true}) // 圧縮するファイルを指定、encoding: false を入れないと壊れる
    .pipe(imagemin([
      mozjpeg({quality: 90, progressive: true}), // JPEG画像の圧縮設定
      pngquant({  // PNG画像の圧縮設定
        quality: [0.8, 0.95],
        speed: 1,
      }),
      svgo({ // SVG画像の圧縮設定
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false }
        ]
      })
    ],{
      verbose: true // ログ情報出力
    }))
  .pipe(dest(destPath.img)) // 出力先ディレクトリを指定
};
export { Clean, ImgImagemin };

// 実行用 ====================================
export default series(Clean, ImgImagemin);
