class LoadingScene extends Phaser.Scene {
  constructor() {
    super('loadingScene');
  }

  preload() {    
    // Display loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 10,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });


  }

  create() {

    const startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'Start', {
      
      font: '30px monospace',
      fill: '#ffffff'
    }).setOrigin(0.5, 0.5);

    startButton.setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('gameScene');
    });
  }
}