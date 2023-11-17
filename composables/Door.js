import MatterEntity from './MatterEntity';

export default class Door extends MatterEntity {
    static preload(scene) {
        scene.load.atlas('doors', 'assets/doors/forest/doors.png', 'assets/doors/forest/doors_atlas.json');
        scene.load.audio('door', 'assets/audio/door.mp3');
    }

    constructor(data) {
        let { scene, door } = data;

        const doorData = {
            door: {
                yOrigin: 8,
                colliderSize: 8,
            },
        }

        const name = door.properties.find(p => p.name === 'name').value;
        const doorTrigger = door.properties.find(p => p.name === 'open').value;

        super({
            scene,
            x: door.x,
            y: door.y,
            texture: 'doors',
            frame: name,
            drops: [],
            depth: 1,
            health: 0,
            name: name,
        });

        this.sound = this.scene.sound.add(name)

        this.x += 0;
        this.y += door.height / 2 / doorData[name].yOrigin;

        const { Bodies } = Phaser.Physics.Matter.Matter;
        const doorCollider = Bodies.circle(this.x, this.y , doorData[name].colliderSize, { isSensor: true, label: 'doorCollider' });
        this.setExistingBody(doorCollider);
        this.setStatic(true);

        // check for Doot Collision
        this.scene.matterCollision.addOnCollideStart({
            objectA:[doorCollider],
            callback: other => {
                if (
                    other.gameObjectB
                    && other.gameObjectB.name === 'player'
                    && other.gameObjectB.y > this.y
                ) {
                    this.toggleDoor(this.scene, doorTrigger, 0);
                }
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA:[doorCollider],
            callback: other => {
                if (
                    other.gameObjectB
                    && other.gameObjectB.name === 'player'
                    && other.gameObjectB.y > this.y
                ) {
                    this.toggleDoor(this.scene, doorTrigger, 1);
                }
            },
            context: this.scene,
        });
    }

    toggleDoor = (scene, trigger, toggle) => {
        scene.add.tween({
            targets: [
                this.scene.layers[`${trigger}-front`],
                this.scene.layers[`${trigger}-front-parts`],
                this.scene.layers[`${trigger}-top-deco`],
                this.scene.layers[`${trigger}-root-parts`],
                this.scene.layers[`${trigger}-roof`],
                this,
            ],
            alpha: toggle,
            duration: 450,
            ease: 'Linear',
        }).play();

        this.sound.play();
    };
}
