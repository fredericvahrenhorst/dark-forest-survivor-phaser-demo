export default class DayNightCircle {
    constructor(scene) {
        this.scene = scene;
        this.isDaytime = true; // Flag to track day/night state

        this.ambientColors = [0x1b1b1b, 0x363636, 0x626262, 0x9f9f9f, 0xc5c5c5, 0xcccccc];
        this.scene.lights.enable().setAmbientColor(this.ambientColors.length - 1); // Set initial ambient color
    }

    toggleDayNight() {
        this.isDaytime = !this.isDaytime;
        this.ambientColors.reverse();

        this.updateAmbientColor();
    }

    updateAmbientColor() {
        this.ambientColors.forEach((color, index) => {
            setTimeout(() => {
                this.scene.lights.setAmbientColor(color); // Set daytime ambient color
            }, 200 * index);
        });
    }
}
