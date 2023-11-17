import MatterEntity from './MatterEntity';
import Inventory from './Inventory';

export default class Player extends MatterEntity {
    static preload (scene) {
        scene.load.atlas('hero', 'assets/sprites/hero.png', 'assets/sprites/hero_atlas.json');
        scene.load.animation('hero_anim', 'assets/sprites/hero_anim.json');
        scene.load.spritesheet('items', 'assets/items/items.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.audio('player', 'assets/audio/player.mp3');
    }

    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super({...data, health: 10, drops: [], name: 'player'});
        this.touching = [];
        this.inventory = new Inventory();

        // Weapons
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', 162);
        this.spriteWeapon.setOrigin(0.25, 0.75);
        this.spriteWeapon.setScale(0.5);
        this.spriteWeapon
        this.scene.add.existing(this.spriteWeapon);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const playerCollider = Bodies.circle(this.x, this.y, 8, { isSensor: false, label: 'playerCollider' });
        const playerSensor = Bodies.circle(this.x, this.y, 18, { isSensor: true, label: 'playerSensor' });

        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: .35,
        });

        this.setExistingBody(compoundBody);
        this.setFixedRotation();

        this.createMiningCollisions(playerSensor);

        this.createPickupCollisions(playerCollider);

        // this.scene.input.on('pointermove', pointer => {
        //     const cursor = pointer;
        //     const playerPosition = new Phaser.Math.Vector2(this.x, this.y);
        //     const angle = Phaser.Math.Angle.BetweenPoints(playerPosition, cursor);

        //     this.setAngle(Phaser.Math.RadToDeg(angle));
        // });
    }

    onDeath = () => {
        this.anims.stop();
        this.anims.play('hero-death', true);
        this.spriteWeapon.destroy();
    };

    update() {
        if (this.dead) return;

        if (this.inventory.selectedItem) {
            this.spriteWeapon.setTexture('items', this.inventory.getItemFrame(this.inventory.selectedItem));
            this.spriteWeapon.setVisible(true);
        } else {
            this.spriteWeapon.setVisible(false);
        }


        const speed = 2.5;
        let playerVelocity = new Phaser.Math.Vector2();

        // check for left / right movement
        const directionMap = {
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 },
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 }
        };

        let moveDirection = null;

        for (const key in directionMap) {
            if (this.inputKeys[key].isDown) {
                playerVelocity.x += directionMap[key].x;
                playerVelocity.y += directionMap[key].y;
                moveDirection = key;
            }
        }

        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y);

        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play(`hero-run-${moveDirection}`, true);
        } else  {
            this.anims.stop(`hero-run-${moveDirection}`);
        }

        // Update weapon on player
        this.spriteWeapon.setPosition(this.x, this.y);
        this.weaponRotate(moveDirection);
    }

    weaponRotate(moveDirection) {
        let pointer = this.scene.input.activePointer;

        if (pointer.isDown) {
            this.weaponRotation += 4;
        } else {
            this.weaponRotation = 0;
        }

        if (moveDirection) {
            this.lastMoveDirection = moveDirection;
        }

        if (this.weaponRotation > 80) {
            this.weaponRotation = 0;
            this.weaponSwing();
        }

        let rotation = 0;
        switch (this.lastMoveDirection) {
            case 'left':
                rotation = -this.weaponRotation - 90;
                break;

            case 'right':
                rotation = this.weaponRotation;
                break;
        }

        this.spriteWeapon.setAngle(rotation);
    }

    weaponSwing() {
        this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);

        this.touching.forEach(gameObject => {
            gameObject.hit();
        });
    }

    createMiningCollisions(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [ playerSensor ],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [ playerSensor ],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching = this.touching.filter(gameObject => gameObject !== other.gameObjectB);
            },
            context: this.scene,
        });
    }

    createPickupCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [ playerCollider ],
            callback: other => {
                if(other.gameObjectB && other.gameObjectB.pickup) {
                    if (other.gameObjectB.pickup()) this.inventory.addItem({ name: other.gameObjectB.name, quantity: 1 });
                }
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [ playerCollider ],
            callback: other => {
                if(other.gameObjectB && other.gameObjectB.pickup) {
                    if (other.gameObjectB.pickup()) this.inventory.addItem({ name: other.gameObjectB.name, quantity: 1 });
                }
            },
            context: this.scene,
        });
    }
}
