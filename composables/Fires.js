import MatterEntity from './MatterEntity';

export default class Fires extends MatterEntity {
    static preload(scene) {
        scene.load.atlas('fire', 'assets/sprites/fire.png', 'assets/sprites/fire_atlas.json');
        scene.load.animation('fire_anim', 'assets/sprites/fire_anim.json');
        scene.load.audio('fire', 'assets/audio/fire.mp3');
    }

    constructor(data) {
        let { scene, fire } = data;

        const name = fire.properties.find(p => p.name === 'name').value;

        super({
            scene,
            x: fire.x,
            y: fire.y,
            texture: 'fire',
            frame: 'tile000',
            drops: [],
            depth: 2,
            health: 0,
            name: null,
        });

        const fireData = {
            fire: {
                yOrigin: 8,
                colliderSize: 8,
            },
        };

        this.x += 0;
        this.y += fire.height / 2 / fireData[name].yOrigin;
        this.playerInRange = null;

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const fireCollider = Bodies.circle(this.x, this.y, 6, { isSensor: false, label: 'fireCollider' });
        const fireSensor = Bodies.circle(this.x, this.y, 140, { isSensor: true, label: 'fireSensor' });

        const compoundBody = Body.create({
            parts: [fireCollider, fireSensor],
        });

        this.setExistingBody(compoundBody);
        this.setStatic(true);
        // this.setPipeline('Light2D');

        this.anims.play('fire-burns', true);
        console.log(this);
        this.sound = scene.sound.add('fire');

        scene.lights.addLight(this.x, this.y, 100).setColor(0xf8fafc).setIntensity(1);

        console.log(this.scene.player);

        this.scene.matterCollision.addOnCollideStart({
            objectA:[fireSensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.playerInRange = other.gameObjectB;
                    this.sound.play();
                }
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA:[fireSensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.playerInRange = null;
                    this.sound.stop();
                };
            },
            context: this.scene,
        });
    }

    update() {
        if (!this.playerInRange) return;

        const distanceThreshold = 200; //This is the max distance from the object. Any farther and no sound is played.
        const distanceToObject = Phaser.Math.Distance.Between(this.playerInRange.x, this.playerInRange.y, this.x, this.y);
        const normalizedSound = 1 - (distanceToObject / distanceThreshold);
        this.sound.volume = normalizedSound;

        console.log(normalizedSound);
    }
}
