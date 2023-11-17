export default class UiBaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);

        this.uiScale = 1.5;
        this.margin = 8;
        this._tileSize = 32;
    }

    get tileSize() {
        return this._tileSize * this.uiScale;
    }
}
