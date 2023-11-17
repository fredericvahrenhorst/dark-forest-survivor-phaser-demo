import MatterEntity from './MatterEntity';

export default class Enemy extends MatterEntity {

    static preload(scene) {
        scene.load.atlas('enemies', 'assets/sprites/enemies.png', 'assets/sprites/enemies_atlas.json');
        scene.load.animation('enemies_anim', 'assets/sprites/enemies_anim.json');
        scene.load.audio('bear', 'assets/audio/bear.mp3');
        scene.load.audio('wolf', 'assets/audio/wolf.mp3');
        scene.load.audio('ent', 'assets/audio/tree.mp3');
    }

    constructor(data) {
        let { scene, enemy } = data;

        const enemiesProps = {
            bear: {
                drops: [
                    {
                        frame: 241,
                        name: 'meat',
                    },
                    {
                        frame: 280,
                        name: 'bone',
                    }
                ],
                health: 10,
            },
            wolf: {
                drops: [
                    {
                        frame: 243,
                        name: 'beef',
                    }
                ],
                health: 5,
            },
            ent: {
                drops: [
                    {
                        frame: 201,
                        name: 'silver',
                    },
                    {
                        frame: 203,
                        name: 'gold',
                    }
                ],
                health: 8,
            },
        }
        const { drops, health } = enemiesProps[enemy.name];

        super({
            scene,
            x: enemy.x,
            y: enemy.y,
            texture: 'enemies',
            frame: `${enemy.name}_idle_1`,
            drops,
            health,
            name: enemy.name,
        });

        this.attackTimer = null;
        this.initialPosition = { x: enemy.x, y: enemy.y };

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const enemyCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'enemyCollider' });
        const enemySensor = Bodies.circle(this.x, this.y, 80, { isSensor: true, label: 'enemySensor' });

        const compoundBody = Body.create({
            parts: [enemyCollider, enemySensor],
            frictionAir: .35,
        });

        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.scene.matterCollision.addOnCollideStart({
            objectA:[enemySensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') this.attacking = other.gameObjectB;
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA:[enemySensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') this.attacking = null;
            },
            context: this.scene,
        });
    }

    attack = (target) => {
        if (target.dead || this.dead) {
            clearInterval(this.attackTimer);
            this.attacking === null;
            return;
        }

        target.hit();
    }

    idle() {
        this.anims.play(`${this.name}-idle`, true);
        this.setVelocityX(0);
        this.setVelocityY(0);
    }

    walk(direction) {
        direction.normalize();
        this.setVelocityX(direction.x);
        this.setVelocityY(direction.y);
    }

    checkLineOfSight(target) {
         // Perform a raycast to check for objects between enemy and target
         const bodies = Phaser.Physics.Matter.Matter.Query.ray(
            this.scene.objects,
            this.position,
            target.position
        );

        if (bodies.length > 0) {
            console.log('Obstacle detected between enemy and target');
            return false;

        } else {
            console.log('Target in Line of Sight');
            return true;
        }
    }

    update() {
        if (this.dead) return;

        // Calculate the distance from the initial position
        const distanceX = this.x - this.initialPosition.x;
        const distanceY = this.y - this.initialPosition.y;
        const distanceFromInitial = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (this.attacking && this.checkLineOfSight(this.attacking)) {
            const direction = this.attacking.position.subtract(this.position);

            if (direction.length() > 24) {
                this.walk(direction);

                if (this.attackTimer) {
                    clearInterval(this.attackTimer);
                    this.attackTimer = null;
                }
            } else {
                if (this.attackTimer === null) {
                    console.log('Attacking');
                    this.attackTimer = setInterval(this.attack, 500, this.attacking);
                }
            }
        } else {
            if (distanceFromInitial > 10) { // Adjust the threshold as needed
                const direction = new Phaser.Math.Vector2(this.initialPosition.x, this.initialPosition.y)
                    .subtract(this.position);
                this.walk(direction);
            } else {
                this.idle();
            }
        }

        this.setFlipX(this.velocity.x < 0);

        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play(`${this.name}-walk`, true);
        }
    }
}
