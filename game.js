// window.onload = function() {
    var config = {
        width: 256,
        height: 272,
        background: 0x000000,
        scene: [Scene1, Scene2],
        physics: {
            default: "arcade",
            arcade: {
                debug:false
            }
        }
    }

    var gameSettings = {
        playerSpeed: 200
    }

    var game = new Phaser.Game(config);
// }