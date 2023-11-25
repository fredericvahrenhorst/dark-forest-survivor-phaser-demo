export default class DayNightCircle {
    constructor(scene) {
        this.scene = scene;
        this.scene.isDaytime = true; // Flag to track day/night state

        // Ambient colors for day/night cycle - Tailwind Slate Shades
        this.ambientColors = [0x020617, 0x0f172a, 0x1e293b, 0x334155, 0x475569, 0x64748b, 0x94a3b8, 0xcbd5e1, 0xe2e8f0, 0xf1f5f9, 0xf8fafc];
        this.scene.lights.enable().setAmbientColor(this.ambientColors[this.ambientColors.length - 1]); // Set initial ambient color
    }

    toggleDayNight() {
        this.scene.isDaytime = !this.scene.isDaytime;
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
