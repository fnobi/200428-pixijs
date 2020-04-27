import * as PIXI from "pixi.js";
import ASSET_BG from "~/assets/sample-pixi/bg.jpg";
import ASSET_CHARA from "~/assets/sample-pixi/chara.png";

const WIDTH = 800;
const HEIGHT = 450;

export default class SamplePixi {
  private app: PIXI.Application;

  private bgContainer: PIXI.Container;

  private mainContainer: PIXI.Container;

  private chara: PIXI.Sprite | null = null;

  private time = 0;

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

  private update(delta: number) {
    this.time += delta;
    if (this.chara) {
      this.chara.position.set(
        WIDTH / 2,
        HEIGHT / 2 + Math.cos((Math.PI * this.time) / 20) * 50
      );
      this.chara.rotation = this.time * 0.03;
    }
  }
}
