import MatterEntity from './MatterEntity';

export default class Resources extends MatterEntity {
    static preload(scene) {
        scene.load.atlas('resources', 'assets/resources/forest/resources.png', 'assets/resources/forest/resources_atlas.json');
        scene.load.audio('tree', 'assets/audio/tree.mp3');
        scene.load.audio('tree-red', 'assets/audio/tree.mp3');
        scene.load.audio('bush', 'assets/audio/bush.mp3');
        scene.load.audio('rock', 'assets/audio/rock.mp3');
        scene.load.audio('pickup', 'assets/audio/pickup.mp3');
    }

    constructor(data) {
        let { scene, resource } = data;
        // super( scene.matter.world, resource.x, resource.y, 'resources', name );
        const resourcesData = {
            tree: {
                yOrigin: 0.7,
                colliderSize: 5,
                drops: [
                    {
                        frame: 272,
                        name: 'wood',
                    },
                    {
                        frame: 272,
                        name: 'wood',
                    },
                ],
            },
            'tree-red': {
                yOrigin: 0.7,
                colliderSize: 5,
                drops: [
                    {
                        frame: 272,
                        name: 'wood',
                    },
                ],
            },
            bush: {
                yOrigin: 0.5,
                colliderSize: 10,
                drops: [
                    {
                        frame: 228,
                        name: 'berries',
                    },
                    {
                        frame: 228,
                        name: 'berries',
                    }
                ],
            },
            rock: {
                yOrigin: 0.5,
                colliderSize: 10,
                drops: [
                    {
                        frame: 273,
                        name: 'stone',
                    },
                    {
                        frame: 273,
                        name: 'stone',
                    }
                ],
            },
        }
        const name = resource.properties.find(p => p.name === 'name').value;
        const depth = resource.properties.find(p => p.name === 'depth').value;
        const resourceData = resourcesData[name];
        const drops = resourceData.drops;

        super({
            scene,
            x: resource.x,
            y: resource.y,
            texture: 'resources',
            frame: name,
            drops,
            depth: depth,
            health: 5,
            name: name,
        });

        this.x += resource.width / 2;
        this.y -= resource.height / 2;

        this.y = this.y + this.height * (resourceData.yOrigin - 0.5);

        const { Bodies } = Phaser.Physics.Matter.Matter;
        const circleCollider = Bodies.circle(this.x, this.y, resourceData.colliderSize, { isSensor: false, label: 'collider' });
        scene.objects.push(circleCollider);
        this.setExistingBody(circleCollider);

        this.setStatic(true);
        this.setOrigin(0.5, resourceData.yOrigin);
    }
}
