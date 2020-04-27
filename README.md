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
- 年表部分はPixiJS・辞書や過去作品のmodalはCSS・オープニングアニメーションでlottie-webも使用
- 画面の縦幅によって、全てをごりっとscaleしてPC/SP/TAB全部に最適化している

## 描画処理の書き方

```ts
import ASSET_BG from "~/assets/bg.png"
import ASSET_CHARA from "~/assets/chara.png"

class SamplePixi {
    public constructor() {
        // もろもろのリソース・メモリ管理をしてくれる人
        // 基本1canvas = 1app
        const app = new PIXI.Application({
            view: document.querySelector('#canvas')
        });

        // 描画するオブジェクトを束ねるやつ。div。
        const bgContainer = new PIXI.Container();
        const mainContainer = new PIXI.Container();
        app.stage.addChild(bgContainer);
        app.stage.addChild(mainContainer);

        app.ticker.add(() => {

        });
    }
}
```

- canvas APIの場合は、毎フレームごとになにを描画するのかを全部指示してやる必要があるが、PixiJSは描画したい内容を定義しておけば、毎フレームでの処理はこちらでほとんど考えなくてよい
    - 手続き的ではなく宣言的（雑な分類）
- addした順で奥→手前の重ね順になるので、Containerをうまく使ってグルーピングして、追加順で挙動がブレるのを防いでおくことが大事

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

## 注意点
- windowに依存 = SSRでそのまま動かすと死ぬ
- テクスチャサイズ問題
- webpack file-loaderとPIXI.Loaderの相性

## まとめ

- 2Dでレスポンスの速いグラフィックを描画したいときはまずPixiJSを選択肢に入れよう
- いくつか落とし穴があるのでそれを避けられる設計にしておくことが大事

## 付録: スピリッツ40周年でのテクい話