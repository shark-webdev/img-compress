## img-compress

Gulpを使った画像一括圧縮用のビルド環境です。  
 `src` ディレクトリの元画像は残したまま、圧縮後の画像を `dest` ディレクトリへ出力します。  
基本は `dest` ディレクトリに残っているファイルを削除し、圧縮後のファイルを出力します。

## 使用環境

- Node.js 20以上
- Gulp 5
- pnpm 11

## セットアップ

初回のみ依存パッケージをインストールします。

```powershell
pnpm install
```

## 使い方

### Windowsの場合（BATファイルで実行）

1. セットアップ後、 `src` ディレクトリに圧縮したい画像を入れます。
2. `compress-images.bat` をダブルクリックします。
3. `dest` ディレクトリの中身が削除され、圧縮後の画像が出力されます。

### コマンドで実行する場合（Windows / macOS / Linux）

```powershell
pnpm build
```

圧縮のみ実行する場合は、次のコマンドを使います。  
※ `dest` 内ファイルを消さずに追加・上書きします。

```powershell
pnpm compress
```

`dest` ディレクトリの削除のみ実行する場合は、次のコマンドを使います。

```powershell
pnpm clean
```

## 対応画像形式

| 形式 | 圧縮内容 |
| --- | --- |
| jpg / jpeg | sharpでクオリティ 90%、progressive JPEG。出力拡張子は `.jpg` に統一 |
| png | sharpでクオリティ 85%、高圧縮設定 |
| webp | sharpでクオリティ 85% |
| avif | sharpでクオリティ 80% |
| tiff | sharpでクオリティ 85%、LZW圧縮 |
| gif | sharpで最適化 |

出力ファイルの拡張子は小文字に変換され、 `jpeg` は `jpg` に統一されます。  
sharpで処理対象外のファイルは圧縮せず、拡張子のみ正規化して出力します。

## 使用パッケージ

- gulp
- gulp-cli
- del
- sharp

## 補足

圧縮前の画像は `src` に残り、`dest` の中身は実行時に削除されてから再生成されます。

---

設計意図や制作メモはこちらです。  
[Notion Portfolio](https://gelatinous-alligator-d9a.notion.site/Portfolio-2fe45c4eb2d980aca9e3e247af534dd9)
