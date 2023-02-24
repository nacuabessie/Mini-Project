const config = {
    type: Phaser.AUTO,
    // pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 500 },
        debug: false 
      },
    },
    scene: [LoadingScene,GameScene],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: {width:800, height:600},
        width: 800,
        height: 600,

    }
  }
  
  const game = new Phaser.Game(config);