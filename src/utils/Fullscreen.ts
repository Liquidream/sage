
// Based on mixure of:
// - https://gist.github.com/Johnz86/afa34e519c2f169a1bb0ddba1fe419cf
// - https://programmer.ink/think/learn-typescript-in-practice-implement-full-screen-browser-100-lines.html

export class Fullscreen {
    private constructor() { /*this class is purely static. No constructor to see here*/ }

    public static openFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();

        } else if (elem.msRequestFullscreen) {
            /* IE/Edge */
            elem.msRequestFullscreen();
        }
    } 

    public static closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { 
            /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { 
            /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
        }
    } 

    public static isFullScreen(): boolean {
        return !!(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement);
    }

    public static toggleFullScreen(): void {
        if (Fullscreen.isFullScreen()) {
            Fullscreen.closeFullscreen();
        } else {
            Fullscreen.openFullscreen();
        }
    }
    
}
