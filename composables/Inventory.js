import itemFrames from './Items';

export default class Inventory {
    constructor() {
        this.maxColumns = 8;
        this.maxRows = 3;
        this.selected = 0;
        this.observers = [];

        this.items = {
            0: {
                name: 'pickaxe',
                quantity: 1,
            },
            2: {
                name: 'stone',
                quantity: 2,
            },
            5: {
                name: 'shovel',
                quantity: 1,
            },
        };


        this.addItem({
            name: 'meat',
            quantity: 2,
        });

        this.addItem({
            name: 'wood',
            quantity: 1,
        });
    }

    subscribe(fn) {
        this.observers.push(fn);
    }

    unsubscribe(fn) {
        this.observers = this.observers.filter(subscriber => subscriber !== fn);
    }

    broadcast() {
        this.observers.forEach(subscriber => subscriber());
    }

    addItem(item) {
        const existingKey = Object.keys(this.items).find(key => this.items[key].name === item.name);

        if (existingKey) {
            this.items[existingKey].quantity += item.quantity;
        } else {
            // search for free slot
            for (let slotIndex = 0; slotIndex < this.maxColumns * this.maxRows; slotIndex++) {
                const existingItem = this.items[slotIndex];

                if (!existingItem) {
                    this.items[slotIndex] = item;
                    break;
                }
            }
        }

        this.broadcast();
    }

    removeItem(itemName) {
        const existingKey = Object.keys(this.items).find(key => this.items[key].name === itemName);

        if (existingKey) {
            this.items[existingKey].quantity -= 1;

            if (this.items[existingKey].quantity <= 0) {
                delete this.items[existingKey];
            }
        }

        this.broadcast();
    }

    getItem(index) {
        return this.items[index];
    }

    moveItem(start, end){
        if (start === end || this.items[end]) return; // no change
        this.items[end] = this.items[start];

        delete this.items[start];

        this.broadcast();
    }

    getItemFrame(item) {
        return itemFrames[item.name].frame;
    }

    getItemQuantity(itemName) {
        const item = Object.values(this.items).find(item => item.name === itemName);
        return item ? item.quantity : 0;
    }

    get selectedItem() {
        return this.items[this.selected];
    }
}
