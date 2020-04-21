# pixi.js入門

## pixi.jsってなんなのさ
- グラフィック描画のライブラリ
- Create.jsというやつが元気だった時代もあったけれど、用途が被っているのでこちらが上位互換と思ってもいいイメージ

## Webグラフィックの選択肢

- HTML・CSS・CSS transition / animationでがんばる
- canvas
    - 2d context
        - 素のcanvas api
        - pixi.js
        - etc...
    - webgl
        - three.js
        - pixi.js
        - etc...

## なぜWebGLをつかうべきか
- 基本的には描画性能の問題
- 特に**大量のオブジェクトを同時描画する**という場合パフォーマンスの違いが顕著
    - 3Dグラフィックを扱うなら一択→単純にさばく情報量・描画量が多い
    - 2Dの場合はそのあたりを加味してどのくらいメリットがあるか考えて選ぶ

## スピリッツ40周年サイト
- 年表部分はpixi.js・辞書部分はCSS
- 画面の縦幅によって、全てをごりっとscaleしてPC/SP/TAB全部に最適化している

## 描画の使い方
- 手続き的ではなく宣言的（雑な言い方）
- 基本的に重ね順はaddした順番になるので、コントロールしたい場合はcontainerをうまく扱うことが大事

## 便利な機能
- ticker
- loader
- AnimatedSprite

## 注意点
- windowに依存＝SSRでそのまま動かすと死ぬ