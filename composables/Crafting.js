import items from './Items';

export default class Crafting {
    constructor(data) {
        let { mainScene } = data;
        this.mainScene = mainScene;
        this.inventory = mainScene.player.inventory;
        this.player = mainScene.player;
        this.selected = 0;
        this.items = [];
    }

    craft() {
        const item = this.items[this.selected];
        if (item.canCraft) {
            new DropItem({ name: item.name, scene: this.mainScene, x: this.player.x -32, y: this.player.y -32, frame: item.frame });
            item.matDetails.forEach(mat => this.inventory.removeItem(mat.name));
        }
    }

    updateItems() {
        this.items = [];
        const craftables = Object.keys(items).filter(key => items[key].craftable);

        for (let index = 0; index < craftables.length; index++) {
            const itemName = craftables[index];
            const mats = items[itemName].mats;
            // Now check if we have enought mats
            let lastMat = '';
            const matDetails = [];
            let canCraft = true;
            let qty = 0;
            mats.forEach(mat => {
                qty = (lastMat === mat) ? qty -1 : this.inventory.getItemQuantity(mat);
                const available = qty > 0;
                matDetails.push({ name:mat, frame: items[mat].frame, available });
                lastMat = mat;
                if(!available) canCraft = false;
            });

            this.items.push({ name: itemName, frame: items[itemName].frame, matDetails, canCraft });
        }

        console.log('updateItems -> this.items: ', this.items);
    }
}
