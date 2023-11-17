import itemFrames from './Items';
import UIBaseScene from './UIScene';

export default class InventoryScene extends UIScene {
    constructor() {
        super('InventoryScene');
        this.rows = 1;
        this.gridSpacing = 0;
        this.inventorySlots = [];

        this.items = itemFrames;
    }

    init(data) {
        let { mainScene } = data;
        this.mainScene = mainScene;
        this.inventory = mainScene.player.inventory;
        this.maxColumns = this.inventory.maxColumns;
        this.maxRows = this.inventory.maxRows;
        this.inventory.subscribe(() => this.refresh());
    }

    destroyInventorySlot(inventorySlot) {
        if (inventorySlot.item) inventorySlot.item.destroy();
        if (inventorySlot.quantityText) inventorySlot.quantityText.destroy();

        inventorySlot.destroy();
    }

    refresh() {
        this.inventorySlots.forEach(s => this.destroyInventorySlot(s));
        this.inventorySlots = [];
        for (let slotIndex = 0; slotIndex < this.maxColumns * this.rows; slotIndex++) {
            const slotPosition = this.margin + this.tileSize / 2;
            const x = slotPosition + ((slotIndex % this.maxColumns) * (this.tileSize + this.gridSpacing));
            const y = slotPosition + (Math.floor(slotIndex / this.maxColumns) * (this.tileSize + this.gridSpacing));

            const inventorySlot = this.add.sprite(x, y, 'items', 11);
            inventorySlot.setScale(this.uiScale);
            inventorySlot.depth = -1;

            // make slot interactive and add hover index
            inventorySlot.setInteractive();
            inventorySlot.on('pointerover', () => {
                this.hoverIndex = slotIndex;
            });

            const item = this.inventory.getItem(slotIndex);

            if (item) {
                inventorySlot.item = this.add.sprite(inventorySlot.x, inventorySlot.y - this.tileSize / 24, 'items', this.items[item.name].frame);
                inventorySlot.quantityText = this.add.text(inventorySlot.x + this.tileSize / 6, inventorySlot.y + this.tileSize / 8, item.quantity, {
                    fill: '#111',
                    font: 'bold 11px sans-serif',
                });

                inventorySlot.item.setInteractive();
                this.input.setDraggable(inventorySlot.item);
            }

            this.inventorySlots.push(inventorySlot);
        }

        this.updateSelection();
    }

    // tint selected slot
    updateSelection() {
        for (let index = 0; index < this.maxColumns; index++) {
            this.inventorySlots[index].tint = index === this.inventory.selected ? 0xffff00 : 0xffffff;
        }
    }

    create() {

        // selection on scroll wheel
        this.input.on('wheel', (pointer, gameObject, deltaX, deltaY, deltaZ) => {
            if (this.mainScene.scene.isActive('CraftingScene')) return;
            this.inventory.selected = Math.max(0, Math.max(0, this.inventory.selected + (deltaY > 0 ? 1 : -1)) % this.maxColumns);
            this.updateSelection();
        })

        // toggle inventory
        this.input.keyboard.on('keydown-I', (event) => {
            this.rows = this.rows === 1 ? this.maxRows : 1;
            this.refresh();
        });

        //dragging
        this.input.setTopOnly(false);
        this.input.on('dragstart', () => {
            this.startIndex = this.hoverIndex;
            this.inventorySlots[this.startIndex].quantityText.destroy();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', () => {
            this.inventory.moveItem(this.startIndex, this.hoverIndex);
            this.refresh();
        });


        this.refresh();
    }
}
