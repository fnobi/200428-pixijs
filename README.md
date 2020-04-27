# PixiJS入門

## PixiJSってなんなのさ
- Webグラフィック描画のライブラリ
- Create.jsというやつが元気だった時代もあったけれど、用途が被っているのでこちらが上位互換と思ってもいいイメージ

## Webグラフィックの選択肢

- DOM
    - HTMLで置いた要素をCSSで装飾してtransition / animationでいい感じに動かす
    - 長尺なアニメーションをつくったりすると泥臭くなりがち

- Canvas
    - 2d context
        - 素のcanvas API
        - PixiJS
        - etc...
    - webgl context
        - 素のwebgl API
        - three.js
        - PixiJS
        - regl
        - etc...
            - https://gist.github.com/dmnsgn/76878ba6903cf15789b712464875cfdc

- SVG
    - 実はフィルタとかアニメーションとかいろいろできる。
    - d3.jsとかlottie-webの内部で使われてるが現状素で書くのはあんまりおすすめしない。

- lottie-web
    - After Effectsで作成したアニメーションをそのままWebサイトにぶちこめる。ハックするとそのうちの一部の画像だけ動的に差し替えるとかもできる。
    - 内部実装的には上と同様CanvasだったりSVGだったりするが、ちょっと立ち位置が違う。本題じゃないのであんまり触れない。

### どうやって選ぶか

- 3Dグラフィックは負荷的にWebGL一択だと思って良い
    - のびも詳しく説明できないけど、WebGL使うと大量の要素を一発でどーんと描画するのがめっちゃはやいってイメージだけ知っておくとよい

- 動的・長めの文章が入ってくる場合はどうしてもDOMが一番便利なので、DOMでのアニメーションをベースで考える

- PixiJSは、2d context・webgl contextの両方に対応しているので、上記以外のケース(Canvasを使う場合)真っ先に選択肢に入れてよい
    - ライブラリ入れるほどじゃねえなーみたいな単純な画像合成の場合は素のcanvas APIを使うこともある（個人的にはけっこう多い）が、しっかりアニメーションする場合は処理性能的にPixiJS突っ込んでおいたほうが無難。

- ひとつのサイトの中でいろんな描画方法を併用するのもあり

## 例) スピリッツ40周年サイト
- https://bigcomicbros.net/spirits40/
- 年表部分はPixiJS・辞書や過去作品のmodalはCSS・オープニングアニメーションでlottie-webも使用
- 画面の縦幅によって、全てをごりっとscaleしてPC/SP/TAB全部に最適化している

## 描画処理の書き方

```ts
public constructor(canvas: HTMLCanvasElement) {
  // もろもろのリソース・メモリ管理をしてくれる人
  // 基本1canvas = 1app
  this.app = new PIXI.Application({
    view: canvas,
    width: WIDTH,
    height: HEIGHT
  });

  // 描画するオブジェクトをグルーピングしてくれるやつ。div的なもの。
  this.bgContainer = new PIXI.Container();
  this.mainContainer = new PIXI.Container();
  this.app.stage.addChild(this.bgContainer);
  this.app.stage.addChild(this.mainContainer);

  // 毎フレーム実行する処理
  this.app.ticker.add(delta => {
    this.update(delta);
  });

  // リソース読み込み開始
  this.load();
}

private load() {
  // 読み込むリソースを端から追加
  this.app.loader.add(ASSET_BG).add(ASSET_CHARA);

  // 読み込み終わったらリソースからテクスチャ、テクスチャからスプライトつくる
  this.app.loader.load((loader, res) => {
    const bgTexture = res[ASSET_BG];
    const charaTexture = res[ASSET_CHARA];
    if (bgTexture) {
      const bg = new PIXI.Sprite(bgTexture.texture);
      this.bgContainer.addChild(bg);
    }
    if (charaTexture) {
      const chara = new PIXI.Sprite(charaTexture.texture);
      chara.anchor.set(0.5, 0.5);
      chara.scale.set(0.5, 0.5);
      this.mainContainer.addChild(chara);
      this.chara = chara;
    }
  });
}
```

- canvas APIの場合は、毎フレームごとになにを描画するのかを全部指示してやる必要があるが、PixiJSは描画したい内容を定義しておけば、毎フレームでの処理はこちらでほとんど考えなくてよい。手続き的ではなく宣言的（雑な分類）。

- 登場人物
    - `PIXI.Application`: PixiJSの処理の一番根幹にいるもの。canvasとPixiJSの処理を繋ぐ役割も持つ
    - `PIXI.Container`: 描画するオブジェクトをグルーピングできるやつ。HTMLで言うとdiv。Photoshopで言うとレイヤーグループ。
    - `PIXI.Texture`: 画像をPixiJS用に取り込んだもの。画像そのものであって座標とかサイズとかは持っていない。
    - `PIXI.Sprite`: 一番基本的な描画オブジェクト。`Texture`を紐付けて、描画する位置とかサイズとかスケールとかを指定できる。


- **addした順で奥→手前の重ね順になる**ので、Containerをうまく使ってグルーピングして、追加順で挙動がブレるのを防いでおくことが大事

- 個人的なセオリーは
    1. PIXI.Applicationを操作するためのクラスをひとつ用意する
    2. 初期化のタイミングでContainerの構造をぜんぶ組み立てる（中には何も入れない）
    3. loaderで必要リソースを全部読み込む
    4. loadが完了したら、リソースからspriteを生成して適切なcontainerに詰めていく。初期状態では表示しないものもとりあえず非表示で置いておいた方がのちのち扱いやすい。
    5. ユーザーインタラクションや時間経過でspriteを動かしたりcontainerを動かしたり

## 便利な機能

- PIXI.Loader
    - リソースをぼこすか渡しておけばまとめて読み込んでくれる
- PIXI.Ticker
    - requestAnimationFrameをやってくれる
    - requestAnimationFrameをそのまま使ってもよいが、PIXI.Application#tickerを使っておけば、appが破棄されたときに自動で消えてくれるので安心
- PIXI.AnimatedSprite
    - 連番アニメーションを再生する機能。ループとか再生停止とか終了時コールバックとか特定フレームで折り返すとか、だいたいのことはできる
    - spritesheetのjsonを渡してやると、対応する画像もロードした上でバラバラのtextureにして返してくれる。いい子。
        - spritesheet: 複数の画像をファイル上１枚の画像に結合してしまい、使うときにはばらばらの状態で使うようにすること・その時のファイル形式。
        - HTTPの仕様上、画像を別々に読み込むと同時接続数とかの上限にぶつかってボトルネックになったりするので、１枚画像に結合することで待ち時間を短縮する効果があったりするぞ。

## 注意点

- **windowに依存 = SSRでそのまま動かすと死ぬ**
    - Nuxt.jsやNext.jsを使ってるとサーバーサイドでHTMLをつくるためにNode.js上でフロントのコードが走る(Server Side Rendering)ことがあるが、そのときPixiJSを参照していると死ぬ
    - nuxtの`client-only`タグとか、nextのdynamic importとかを使って回避してやる必要がある
- **テクスチャサイズ問題**
    - WebGLでは、表示できるテクスチャのサイズに上限がある。特にスマホではPCより軒並み小さめなので、実機で表示されるかどうかを確認しないとあぶない。
        - http://webglstats.com/webgl/parameter/MAX_TEXTURE_SIZE
    - 4096x4096とスマホでもまあまあ大きい上限なのだが、spritesheetでぜんぶ結合したり長尺の連番アニメーションをつくったりするとあっさり超えたりする
- **webpack file-loaderとPIXI.Loaderの相性**
    - PIXI.Loaderでspritesheetを読み込む場合、画像のパスはjsonの中に埋め込まれてしまっているので、file-loaderを使ってrequireで参照したいときにできなかったりする
    - こだわらなくていいならfile-loaderを介さない形で読み込んでしまったほうが楽。こだわりたいときは、画像とjson別々に読み込んで自力でテクスチャを組み立てることも可能（がんばれば）（スピリッツ40周年サイトではがんばってます）

## まとめ

- Webグラフィックスの選択肢はいろいろある。2Dでレスポンスの速いグラフィックを描画したいときはまずPixiJSを選択肢に入れよう。
- いくつか落とし穴があるのでそれを避けられる設計にしておくことが大事。

## 付録: スピリッツ40周年サイトでのテクい話

- axis-psd × spritesheet-js
    - photoshopファイルから[axis-psd](https://www.npmjs.com/package/axis-psd)ですべての要素の座標データを出力
    - photoshopから書き出した画像を[spritesheet-js](https://www.npmjs.com/package/spritesheet-js)ですべて結合
    - フロント側でspritesheetの読み込み・テクスチャ化＆ファイル名で座標データと照合してPSD通りの場所に再配置
    - →全部の要素をバラバラに扱うことに成功・法外にデカい画像を扱わずに済む＆ぜんぶバラバラに動かせるのでパララックス演出が可能に

- CSSで縦書きのサイトをつくるの案外まともに動く
    - `writing-mode: vertical-rl;` `text-orientation: mixed;` の２つだけ入れればあっさりすべてが縦書きになる
    - ブラウザ対応的にだいぶ怖かったが、IE切れば基本まともに動くことが分かった
    - CSSではなくフォントの問題で、縦書き時に表示崩れするものがある。Androidは特に入ってるフォントが読めないので危ない。google fontsで読み込めるNoto Serifは優秀だった。
    - flex-boxの向きが90度ずれるがwidthやheightやmarginとかの向きはそのままなので頭がこんがらがる

- 大量の作品データの管理
    - ぜんぶスプレッドシートです！丁寧に情報をまとめてくれた皆様に圧倒的感謝。
    - [sheet-loader](https://www.npmjs.com/package/sheet-loader)を使ってjsonとしてエクスポートできるようにしておき、ビルド時にpugに渡す。シートをインポートしてビルドし直すことで更新作業が終了するようになっている。
    - idは全体的に共通で番号を振っている。年表でコマ等押した時に出す作品の紐付けもシートのidから。そのためにphotshop上で各コマの画像を書き出す際の命名規則もこれに揃えている。