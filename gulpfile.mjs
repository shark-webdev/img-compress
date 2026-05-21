import gulp from 'gulp';
const { series, src, dest } = gulp;
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { Transform } from 'node:stream';
import { deleteAsync } from 'del'; // 削除
import sharp from 'sharp'; // 画像の圧縮

// パス設定 ====================================
const srcPath = {
  img: './src/**/*',
}
const destPath = {
  img: './dest/',
}

const sharpOptions = {
  jpg: { quality: 90, progressive: true, mozjpeg: true },
  png: { quality: 85, effort: 10, compressionLevel: 9 },
  webp: { quality: 85, effort: 6 },
  avif: { quality: 80, effort: 6 },
  tiff: { quality: 85, compression: 'lzw' },
  gif: { effort: 10 },
};
const sharpFormats = {
  jpg: 'jpeg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  tiff: 'tiff',
  gif: 'gif',
};

const normalizeExt = (filePath) => {
  const ext = extname(filePath);
  if (!ext) {
    return filePath;
  }

  const normalizedExt = ext.toLowerCase() === '.jpeg' ? '.jpg' : ext.toLowerCase();
  return join(dirname(filePath), `${basename(filePath, ext)}${normalizedExt}`);
};

const compressWithSharp = () => new Transform({
  objectMode: true,
  async transform(file, _encoding, callback) {
    if (file.isNull()) {
      file.path = normalizeExt(file.path);
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new Error('Streaming is not supported.'));
      return;
    }

    const originalExt = extname(file.path).toLowerCase();
    const outputExt = originalExt === '.jpeg' ? '.jpg' : originalExt;
    const format = outputExt.slice(1);

    file.path = normalizeExt(file.path);

    if (!Object.hasOwn(sharpOptions, format)) {
      callback(null, file);
      return;
    }

    try {
      file.contents = await sharp(file.contents)
        .rotate()
        .toFormat(sharpFormats[format], sharpOptions[format])
        .toBuffer();
      callback(null, file);
    } catch (error) {
      callback(error);
    }
  },
});

// destディレクトリ内のファイルを削除 ============
const Clean = async () => {
  await deleteAsync([`${destPath.img}/**`, `!${destPath.img}`]);
};

// 画像圧縮 ====================================
const ImgSharp = () => {
  if (!existsSync('./src')) {
    return Promise.resolve();
  }

  return src(srcPath.img, {encoding: false, allowEmpty: true}) // 圧縮するファイルを指定、encoding: false を入れないと壊れる
    .pipe(compressWithSharp())
  .pipe(dest(destPath.img)) // 出力先ディレクトリを指定
};
const ImgImagemin = ImgSharp;
export { Clean, ImgSharp, ImgImagemin };

// 実行用 ====================================
export default series(Clean, ImgSharp);
