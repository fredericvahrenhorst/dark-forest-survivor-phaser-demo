<template>
    <div class="container">
        <section id="survival-game"></section>
    </div>
</template>

<script setup>
    import Phaser from 'phaser';
    import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
    import InventoryScene from '../composables/InventoryScene';
    import CraftingScene from '../composables/CraftingScene';

    const config = {
        width: 640,
        height: 400,
        backgroundColor: '#eeeeee',
        type: Phaser.AUTO,
        parent: 'survival-game',
        scene: [ MainScene, InventoryScene, CraftingScene ],
        scale: {
            // Fit to window
            // mode: Phaser.Scale.FIT,
            // // Center vertically and horizontally
            autoCenter: Phaser.Scale.CENTER_BOTH,
            zoom: 2,
        },
        physics: {
            default: 'matter',
            matter: {
                debug: true,
                gravity: {
                    y: 0
                }
            }
        },
        plugins: {
            scene: [
                {
                    plugin: PhaserMatterCollisionPlugin,
                    key: 'matterCollision',
                    mapping: 'matterCollision'
                },
            ]
        }
    }

    let game;

    onMounted(() => {
        game = new Phaser.Game(config);
    });

    onUpdated(() => {
        console.log('GameScene updated');
    });

    onUnmounted(() => {
        game.destroy();
    });
</script>

<style>
    body {
        margin: 0;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    #survival-game {
        aspect-ratio: 16/10;
    }

</style>
