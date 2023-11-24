import Phaser from 'phaser';
import Player from './Player';
import Resources from './Resources';
import Door from './Door';
import Enemy from './Enemy';
import DayNightCircle from './DayNightCircle';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');

        this.enemies = [];
        this.objects = [];
    }

    preload() {
        Player.preload(this);
        Resources.preload(this);
        Door.preload(this);
        Enemy.preload(this);
        // this.load.image('tilespng', 'assets/tiles/RPG-Nature-Tileset-extended.png');
        // this.load.tilemapTiledJSON('mapjson', 'assets/tiles/map.json');

        this.load.image('forest-props', 'assets/tiles/forest/forest-props.png');
        this.load.image('forest-tileset', 'assets/tiles/forest/forest-tileset.png');
        this.load.image('forest-structures', 'assets/tiles/forest/forest-structures.png');
        this.load.image('forest-cliff', 'assets/tiles/forest/forest-cliff.png');
        this.load.image('water-tileset', 'assets/tiles/forest/water-tileset.png');
        this.load.image('forest-settlement', 'assets/tiles/forest/forest-settlement.png');

        this.load.tilemapTiledJSON('mapjson', 'assets/tiles/forest/map.json');

        this.load.audio('theme-regular', 'assets/audio/theme-regular.mp3');
    }

    create() {
        // Load the tilemap
        const map = this.make.tilemap({ key: 'mapjson' });
        // const tileset = map.addTilesetImage('RPG-Nature-Tileset', 'tilespng', 32, 32, 1, 2);
        const tilesetProps = map.addTilesetImage('forest-props', 'forest-props');
        const tileset = map.addTilesetImage('forest-tileset', 'forest-tileset');
        const tilesetStructures = map.addTilesetImage('forest-structures', 'forest-structures');
        const tilesetCliff = map.addTilesetImage('forest-cliff', 'forest-cliff');
        const tilesetWater = map.addTilesetImage('water-tileset', 'water-tileset');
        const tilesetSettlement = map.addTilesetImage('forest-settlement', 'forest-settlement');
        this.map = map;

        // Create the Groud layer
        // const groundLayer = map.createLayer('ground', tileset, 0, 0);

        this.layers = {
            basic: map.createLayer('basic', tileset),
            water: map.createLayer('water', tilesetWater),
            'grass-dark': map.createLayer('grass-dark', tileset),
            sand: map.createLayer('sand', tileset),
            'house-inner': map.createLayer('house-inner', tilesetSettlement),
            'house-inner-parts': map.createLayer('house-inner-parts', tilesetSettlement),
            'house-front': map.createLayer('house-front', tilesetSettlement),
            'house-front-parts': map.createLayer('house-front-parts', tilesetSettlement).setDepth(3),
            'house-root-parts': map.createLayer('house-root-parts', tilesetSettlement).setDepth(3),
            'house-top-deco': map.createLayer('house-top-deco', tilesetSettlement).setDepth(3),
            'house-roof': map.createLayer('house-roof', tilesetSettlement).setDepth(3),
        };

        // for each layer
        Object.keys(this.layers).forEach(layerName => {
            const layer = this.layers[layerName];
            layer.setCollisionByProperty({ collides: true }).setPipeline('Light2D');
            this.matter.world.convertTilemapLayer(layer);
        });

        // Create the Doors layer
        this.map.getObjectLayer('doors').objects.forEach(door => new Door({ scene:this, door }) );

        // // Create the Resources layer
        this.map.getObjectLayer('resources').objects.forEach(resource => new Resources({ scene:this, resource }));

        // // Create the Enemies layer
        // this.map.getObjectLayer('enemies').objects.forEach(enemy => this.enemies.push( new Enemy({ scene:this, enemy }) ));

        // Play theme Music
        // this.music = this.sound.play('theme-regular', { loop: true, volume: 0.5 });

        // Create the Player
        this.player = new Player({ scene: this, x: 1451, y: 1008, texture: 'hero', frame: 'tile000' });
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Set Camera with Options
        const camera = this.cameras.main;
        camera.zoom = 2;
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.layers.basic.width, this.layers.basic.height);

        // Create the Inventory
        this.scene.launch('InventoryScene', { mainScene: this });

        // Create the Crafting
        this.crafting = new Crafting({ mainScene: this });
        this.input.keyboard.on('keydown-C', () => {
            if (this.scene.isActive('CraftingScene')) this.scene.stop('CraftingScene');
            else this.scene.launch('CraftingScene', { mainScene: this });
        });

        // this.lights.enable().setAmbientColor(0x242424);
        // this.lights.enable().setAmbientColor(0xcccccc);
        this.dayNightCircle = new DayNightCircle(this); // Instantiate DayNightManager

        setInterval(() => {
            this.dayNightCircle.toggleDayNight();
        }, 2000);
    }

    update() {
        this.enemies.forEach(enemy => enemy.update());
        this.player.update();
    }
}
