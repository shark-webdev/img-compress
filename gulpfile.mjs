import gulp from 'gulp';
const { series, src, dest } = gulp;
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { Transform } from 'node:stream';
import { deleteAsync } from 'del'; // 削除
import sharp from 'sharp'; // 画像の圧縮

// パス設定 ====================================
const srcPath = {
  img: './src/**/*.{png,jpg,jpeg,webp,avif,tif,tiff,gif,PNG,JPG,JPEG,WEBP,AVIF,TIF,TIFF,GIF}',
}
const destPath = {
  img: './dest/',
}

// sharp設定 ====================================
const sharpInputOptions = {
  failOn: 'warning',
  limitInputPixels: 12000 * 12000,
};

const sharpOutputOptions = {
  jpg: {
    quality: 92,
    progressive: true,
    mozjpeg: true,
    chromaSubsampling: '4:4:4',
  },
  png: {
    compressionLevel: 9,
    effort: 10,
  },
  webp: {
    quality: 92,
    alphaQuality: 100,
    effort: 6,
    smartSubsample: true,
  },
  avif: {
    quality: 90,
    effort: 6,
  },
  tif: {
    quality: 92,
    compression: 'lzw',
  },
  tiff: {
    quality: 92,
    compression: 'lzw',
  },
  gif: {
    effort: 10,
  },
};

const sharpFormats = {
  jpg: 'jpeg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  tif: 'tiff',
  tiff: 'tiff',
  gif: 'gif',
};

const getSharpInputOptions = (format) => {
  if (format === 'gif') {
    return { ...sharpInputOptions, animated: true };
  }

  return sharpInputOptions;
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

    if (!file.isBuffer()) {
      callback(new Error(`${file.relative} is not a buffer.`));
      return;
    }

    const originalExt = extname(file.path).toLowerCase();
    const outputExt = originalExt === '.jpeg' ? '.jpg' : originalExt;
    const format = outputExt.slice(1);

    file.path = normalizeExt(file.path);

    if (!Object.hasOwn(sharpOutputOptions, format)) {
      callback(null, file);
      return;
    }

    try {
      file.contents = await sharp(file.contents, getSharpInputOptions(format))
        .rotate()
        .toFormat(sharpFormats[format], sharpOutputOptions[format])
        .toBuffer();
      callback(null, file);
    } catch (error) {
      callback(error);
    }
  },
});

// destディレクトリ内のファイルを削除 ============
const clean = async () => {
  await deleteAsync([`${destPath.img}/**`, `!${destPath.img}`]);
};

// 画像圧縮 ====================================
const imgSharp = () => {
  if (!existsSync('./src')) {
    return Promise.resolve();
  }

  return src(srcPath.img, { encoding: false, allowEmpty: true }) // 圧縮するファイルを指定、encoding: false を入れないと壊れる
    .pipe(compressWithSharp())
    .pipe(dest(destPath.img)) // 出力先ディレクトリを指定
};
const imgImagemin = imgSharp;
export { clean, imgSharp, imgImagemin };

// 実行用 ====================================
export default series(clean, imgSharp);
