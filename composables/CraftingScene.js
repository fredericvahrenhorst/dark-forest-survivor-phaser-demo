import { GameObjects } from 'phaser';
import UIScene from './UIScene';

export default class CraftingScene extends UIScene {
    constructor() {
        super('CraftingScene');

        this.craftingSlots = [];
        this.uiScale = 1.0;
    }

    init(data) {
        let { mainScene } = data;
        this.mainScene = mainScene;
        this.crafting = mainScene.crafting;

        this.crafting.inventory.subscribe(() => this.updateCraftableSlots());
    }

    create() {
        this.updateCraftableSlots();
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ)=> {
            this.crafting.selected = Math.max(0, this.crafting.selected + (deltaY > 0 ? 1 : -1)) % this.crafting.items.length;
            this.updateSelected();
        })

        this.input.keyboard.on('keydown-E', () => {
            this.crafting.craft();
        });
    }

    destroyCraftingSlot(craftingSlot) {
        craftingSlot.matItems.forEach(item => item.destroy());
        craftingSlot.item.destroy();
        craftingSlot.destroy();
    }

    updateSelected() {
        for (let index = 0; index < this.crafting.items.length; index++) {
            this.craftingSlots[index].tint = this.crafting.selected === index ? 0xffff00 : 0xffffff;
        }
    }

    updateCraftableSlots() {
        this.crafting.updateItems()
        const scale = .85;

        for (let index = 0; index < this.crafting.items.length; index++) {
            if (this.craftingSlots[index]) this.destroyCraftingSlot(this.craftingSlots[index]);
            const craftableItems = this.crafting.items[index];
            const x = this.margin + this.tileSize / 2;
            const y = index * this.tileSize + this.game.config.height / 2;

            this.craftingSlots[index] = this.add.sprite(x, y, 'items', 11);
            this.craftingSlots[index].item = this.add.sprite(x, y, 'items', craftableItems.frame).setScale(scale);
            this.craftingSlots[index].item.tint = craftableItems.canCraft ? 0xffffff : 0x555555;
            this.craftingSlots[index].matItems = [];

            for (let matIndex = 0; matIndex < craftableItems.matDetails.length; matIndex++) {
                const matItem = craftableItems.matDetails[matIndex];
                this.craftingSlots[index].matItems[matIndex] = this.add.sprite(x + this.tileSize + matIndex * this.tileSize * scale, y, 'items', matItem.frame);
                this.craftingSlots[index].matItems[matIndex].setScale(scale);
                this.craftingSlots[index].matItems[matIndex].tint = matItem.available ? 0xffffff : 0x555555;
            }
        }
    }
}
