class Dude extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'dude');
      this.scene = scene;
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setCollideWorldBounds(true);
      this.body.setSize(20, 32).setOffset(6,16);
      this.lockedTo = null;
      this.isGrounded;
      this.wasGrounded;
      this.trailTimer = 100;
      this.status = Dude.Status.Walking;
   
    } 
  
    static Status = {
      Walking: 1,
      Jumping: 2,
      Climbing: 3,
      Falling: 4,
    }
  
    update(time, delta) {
     
      this.isGrounded = this.body.onFloor();
      this.trailTimer -= delta;
      switch(this.status) {
  
        case Dude.Status.Walking:
      
          if (this.scene.cursors.right.isDown) {
            this.body.setVelocityX(160);
            this.setFlipX(false);
            this.anims.play('walk', true);
            this.createDustTrail(1)
          } else if (this.scene.cursors.left.isDown) {   
            this.body.setVelocityX(-160)
            this.setFlipX(true)
            this.anims.play('walk', true);
            this.createDustTrail(-1)
          } else {
            this.body.setVelocityX(0);
            this.anims.play('idle-right', true);
          }    
          if (Phaser.Input.Keyboard.JustDown(this.scene.spacebar) && this.isGrounded) {
            this.setVelocityY(-300);
            this.status = Dude.Status.Jumping             
          };
          if (!this.isGrounded && this.wasGrounded) {
            this.setStatus(Dude.Status.Falling);
          }
          break;
        case Dude.Status.Falling:
          if (this.isGrounded) {
            this.scene.dust.emitParticleAt(this.x, this.body.bottom);
            this.setStatus(Dude.Status.Walking)
          };  
          break;
          
        case Dude.Status.Jumping:
          if (this.isGrounded) {
            this.scene.dust.emitParticleAt(this.x, this.body.bottom);
            this.setStatus(Dude.Status.Walking)
          };  
          break;
          
        case Dude.Status.Climbing:
          if (this.scene.cursors.right.isDown) {
            this.setStatus(Dude.Status.Walking);
          }
          else if (this.scene.cursors.left.isDown) {   
            this.setStatus(Dude.Status.Walking);
          }
          
          if (this.scene.cursors.up.isDown && this.body.bottom > this.lockedTo.body.top) {               
            this.anims.play('climb', true);
            this.body.setVelocityY(-160);
          }
          else if (this.scene.cursors.down.isDown && !this.isGrounded)
            if (this.body.top < this.lockedTo.body.bottom) {      
              this.anims.play('climb', true);
              this.body.setVelocityY(160)
            }
            else {
              this.setStatus(Dude.Status.Walking);
            }
          else {
            this.anims.play('idle-climb',true)
            this.body.setVelocityY(0)
          }
          break;
       
      }
    
      this.wasGrounded = this.isGrounded;
    }
  
    createDustTrail(dir) {
      if (this.trailTimer <0) {            
        this.scene.trail.setSpeedX(dir*50)
          .emitParticleAt(dir === 1 ? this.body.left : this.body.right,  this.body.bottom);   
        this.trailTimer = 50;  
      }
    }
  
    setStatus(newStatus) {
      this.status = newStatus;
      switch (this.status) {
        case Dude.Status.Walking:
          this.body.setAllowGravity(true);
          break;
      
        case Dude.Status.Climbing:
          this.body.stop();
          this.body.setAllowGravity(false);
          break;
      }
        
    }
  }
  
  
  class GameScene extends Phaser.Scene {
    constructor() {
      super('gameScene');
    
    }
    
    preload() {
        const dudelink = 'https://raw.githubusercontent.com/cedarcantab/photonstorm/main/issue-003/assets/dude.png';
        const dudejson = 'https://raw.githubusercontent.com/cedarcantab/photonstorm/main/issue-003/assets/dude.json';
        const white = 'https://raw.githubusercontent.com/cedarcantab/photonstorm/main/issue-003/assets/white.png';
        const laddermid = 'https://raw.githubusercontent.com/cedarcantab/photonstorm/main/issue-003/assets/ladder-thin-mid.png';
        const laddershort = 'https://raw.githubusercontent.com/cedarcantab/photonstorm/main/issue-003/assets/ladder-thin-short.png';
        
        this.load.image('background', 'assets/Sunset.jpg');
        this.load.image('ground', 'assets/branch.png'); // 400x32
        // this.load.image('sky', sky);
        this.load.image('white', white);
        this.load.image('grassyground', 'assets/tile.png' ); // 384x28
        this.load.image('ladder-thin-long', 'assets/ladder-long.png');
        this.load.image('ladder-thin-mid', laddermid);
        this.load.image('ladder-thin-short', laddershort);
        this.load.atlas('dude', dudelink, dudejson);
   
    }
    
    create() {
     
      this.add.image(400, 300, 'background').setScale(1.6);  
      this.ground = this.add.tileSprite(0,600-28,800,28,'grassyground').setOrigin(0);
      this.physics.add.existing(this.ground);
      this.ground.body.setAllowGravity(false)
      this.ground.body.setImmovable(true)
  
      this.platforms = this.physics.add.staticGroup();  
      this.platforms.create(0,250,'ground').setOrigin(0,0).refreshBody();
      this.platforms.create(0,400,'ground').setOrigin(0,0).refreshBody();
  
      this.ladders = this.physics.add.staticGroup();
      this.ladders.create(100,600-28,'ladder-thin-long').setOrigin(0,1).refreshBody();
      this.ladders.create(250,249.99,'ladder-thin-mid').setOrigin(0,0).refreshBody(); // the ladder needs to "stick-out" from the platform at the top, even by 1 pixel
      this.ladders.create(400-32,600-28,'ladder-thin-long').setOrigin(0,1).refreshBody();
      
      this.dude = new Dude(this, 200, 550);
  
      this.createParticles();
   this.createAnims();
  
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      
      this.physics.add.collider(this.dude, this.ground);
      this.physics.add.collider(this.dude, this.platforms, null, this.passThru, this);
      this.physics.add.overlap(this.dude, this.ladders, this.climbLadder, this.canClimb, this);
      
      
    }
    
    update(time, delta) {
      this.dude.update(time, delta);   
    }
    
    passThru(dude, ladder) {
      return (dude.status !== Dude.Status.Climbing)  
    }
  
    canClimb(dude, ladder) {
  
      return  (
        (dude.body.left>=ladder.body.left && dude.body.right<= ladder.body.right) &&
        ((this.cursors.up.isDown && (dude.body.bottom-dude.body.deltaY()) > ladder.body.top) || this.cursors.down.isDown)   
      )
    }
  
    climbLadder(dude, ladder) {
      dude.lockedTo = ladder;
      dude.setStatus(Dude.Status.Climbing);      
      
    }
    
   createAnims() {
   
     this.anims.create({
        key: 'idle-front',
         frames: this.anims.generateFrameNames('dude', {
          prefix: 'idle-front',
          suffix: '.png',
          start: 1,
          end: 3
        }),
        frameRate: 5,
        repeat: -1
     });
  
     this.anims.create({
        key: 'idle-right',
         frames: this.anims.generateFrameNames('dude', {
          prefix: 'idle-right',
          suffix: '.png',
          start: 1,
          end: 3
        }),
        frameRate: 5,
        repeat: -1
     });
  
     this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('dude', {
          prefix: 'right',
          suffix: '.png',
          start: 1,
          end: 2
        }),
        frameRate: 10,
        repeat: -1
      })
      
      this.anims.create({
        key: 'climb',
         frames: this.anims.generateFrameNames('dude', {
          prefix: 'climb',
          suffix: '.png',
          start: 1,
          end: 2
        }),
        frameRate: 5,
        repeat: -1
      })
   
     this.anims.create({
       key: 'idle-climb',
       frames: [{key: 'dude', frame: 'climb1.png'}]
     })
    }
    
    createParticles() {
   
      this.dust =  this.add.particles('white').createEmitter({
        quantity: 20,
        lifespan: 300,
        speed: { min: 50, max: 100 },
        angle: { min: 0, max: -180 },
        gravityY: 200,
        scale: {start:0.5, end: 0},
        alpha: { start: 1, end: 0 },
        frequency: -1,
        on: false
      });
     
      this.zone = new Phaser.Geom.Rectangle(-10,-5,20,6); 
      this.trail=  this.add.particles('white').createEmitter({
        lifespan: 200,
        speedY: {min:-50, max:-20},
        scale: 0.3,
        alpha: { start: 1, end: 0 },
        blendMode: 'ADD',
        emitZone: { type: 'random', source: this.zone },
        frequency: -1,
        on: false
      });
   }
    
   
  } 
  
  
