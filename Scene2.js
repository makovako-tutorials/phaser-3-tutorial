class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame")
    }

    create() {

        // autoscrolling background
        this.background = this.add.tileSprite(0,0,config.width,config.height,"background")
        this.background.setOrigin(0,0) // setting pivot/anchor point

        // ships as sprites
        this.ship1 = this.add.sprite(config.width/2 - 50, config.height/2,"ship")
        this.ship2 = this.add.sprite(config.width/2, config.height/2,"ship2")
        this.ship3 = this.add.sprite(config.width/2 + 50, config.height/2,"ship3")

        // enabling screen bounds 
        this.physics.world.setBoundsCollision()

        // managing ships as enemies
        this.enemies = this.physics.add.group()
        this.enemies.add(this.ship1)
        this.enemies.add(this.ship2)
        this.enemies.add(this.ship3)
     
        // managing powerups
        this.powerUps = this.physics.add.group()

        var maxObjects = 4;
        for (var i = 0; i<= maxObjects; i++) {
            var powerUp = this.physics.add.sprite(16,16,"power-up")
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0,0,game.config.width, game.config.height)

            if (Math.random() > 0.5) {
                powerUp.play("red")
            } else {
                powerUp.play("gray")
            }

            powerUp.setVelocity(100,100)
            powerUp.setCollideWorldBounds(true)
            powerUp.setBounce(1)
        }

        // animate ships
        this.ship1.play("ship1_anim")
        this.ship2.play("ship2_anim")
        this.ship3.play("ship3_anim")

        // allow clicking on ships
        this.ship1.setInteractive()
        this.ship2.setInteractive()
        this.ship3.setInteractive()

        // mouse input on ship
        this.input.on('gameobjectdown', this.destroyShip, this)


         //modifications
        // this.ship1.setScale(2)
        // this.ship2.flipY = true
        // this.ship3.angle += 30

        this.player = this.physics.add.sprite(config.width/2 -8, config.height - 64,"player")
        this.player.play("thrust")
        this.player.setCollideWorldBounds(true)

        this.cursorKeys = this.input.keyboard.createCursorKeys()

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.projectiles = this.add.group()

        // collider - they touch
        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp) {
            projectile.destroy()
        })

        //they overlap
        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this)
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this)
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this)

        // HUD Overlay
        var graphics = this.add.graphics()
        graphics.fillStyle(0x000000,1)
        graphics.beginPath()
        graphics.moveTo(0,0)
        graphics.lineTo(config.width,0)
        graphics.lineTo(config.width,20)
        graphics.lineTo(0,20)
        graphics.lineTo(0,0)
        graphics.closePath()
        graphics.fillPath()

        //score
        this.score = 0

        // score label
        this.scoreLabel = this.add.bitmapText(10,5, "pixelFont","SCORE ",16)

    }

    //prettifying score
    zeroPad(number, size) {
        var stringNumber = String(number)
        while(stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber
        }
        return stringNumber
    }

    // player touches powerup
    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true)
    }

    // player touches enemy
    hurtPlayer(player, enemy) {
        this.resetShipPos(enemy)

        if(this.player.alpha < 1) {
            return
        }

        var explosion = new Explosion(this, player.x, player.y)
        player.disableBody(true,true)

        //timer
        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        })
    }

    // hit enemy with projectile
    hitEnemy(projectile, enemy) {
        var explosion = new Explosion(this, enemy.x, enemy.y)

        projectile.destroy()
        this.resetShipPos(enemy)

        this.score += 15
        var scoreFormated = this.zeroPad(this.score, 6)
        this.scoreLabel.text = "SCORE " + scoreFormated
    }

    // shipp fall down
    moveShip(ship,speed) {
        ship.y += speed
        if (ship.y > config.height) {
            this.resetShipPos(ship)
        }
    }

    // reset positon of ship
    resetShipPos(ship) {
        ship.y = 0
        var randomX = Phaser.Math.Between(0, config.width)
        ship.x = randomX
    }

    // reset player after death
    resetPlayer() {
        var x = config.width /2 - 8
        var y = config.height + 64
        this.player.enableBody(true,x,y,true,true)

        // so ships wont collide, see hurtPlayer for alpha checking
        this.player.alpha = 0.5

        // event/timer and animate
        var tween = this.tweens.add({
             targets: this.player,
             y: config.height-64,
             ease: 'Power1',
             duration: 1500,
             repeat:0,
             onComplete: function(){
                 this.player.alpha = 1 
             },
             callbackScope:this
        })
    }

    // animate destroyed ship
    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion")
        gameObject.play("explode")
    }

    // move player based on cursor keys
    movePlayerManager() {
        if (this.cursorKeys.left.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed)
        } else if (this.cursorKeys.right.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed)
        } else {
            this.player.setVelocityX(0)
        }
        if(this.cursorKeys.up.isDown) {
            this.player.setVelocityY(-gameSettings.playerSpeed)
        } else if (this.cursorKeys.down.isDown) {
            this.player.setVelocityY(gameSettings.playerSpeed)
        } else {
            this.player.setVelocityY(0)
        }
    }

    // shoot
    shootBeam(){
        var beam = new Beam(this)
         
    }

    // update everytime
    update() {
        this.moveShip(this.ship1, 1)
        this.moveShip(this.ship2, 2)
        this.moveShip(this.ship3, 3)
        this.background.tilePositionY -= 0.5

        this.movePlayerManager()

        // shoot on spacebar
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if(this.player.active){
                this.shootBeam()
            }
        }

        for(var i = 0; i< this.projectiles.getChildren().length;i++){
            var beam = this.projectiles.getChildren()[i];
            //run beam update, it check if it is in screen
            beam.update()
        }
    }


    
}