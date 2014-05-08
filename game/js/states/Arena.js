	'use strict';
/* global GameCtrl */
/* global Phaser */
var BULLET_SPEED_TIME = 1; //Should say 1.
var MAX_SPEED = 300/BULLET_SPEED_TIME; // pixels/second
var MAX_SPEED_Y = 1000/BULLET_SPEED_TIME; // pixels/second
var MOVE_ACCELERATION = MAX_SPEED*5/BULLET_SPEED_TIME; // pixels/second/second
var YSPEED = 800/BULLET_SPEED_TIME;
var GRAVITY = 2000/BULLET_SPEED_TIME; 
var DRAG = 0/BULLET_SPEED_TIME; // pixels/second


// Define constants
var SHOT_DELAY = 200; // milliseconds (10 bullets/second)
var BULLET_SPEED = 400; // pixels/second
var NUMBER_OF_BULLETS = 200;

(function(){
	GameCtrl.Arena = function () {

			//        When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
	/*
		this.game;                //        a reference to the currently running game
		this.add;                //        used to add sprites, text, groups, etc
		this.camera;        //        a reference to the game camera
		this.cache;                //        the game cache
		this.input;                //        the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
		this.load;                //        for preloading assets
		this.math;                //        lots of useful common math operations
		this.sound;                //        the sound manager - add a sound, play one, set-up markers, etc
		this.stage;                //        the game stage
		this.time;                //        the clock
		this.tweens;        //        the tween manager
		this.world;                //        the game world
		this.particles;        //        the particle manager
		this.physics;        //        the physics manager
		this.rnd;                //        the repeatable random number generator
	*/
		//        You can use any of these from any function within this State.
		//        But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

	};


	function getRndColor(){
		var letters = '0123456789ABCDEF'.split('');
		var color = '';
		for (var i = 0; i < 6; i++ ) {
		    color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	GameCtrl.Arena.prototype = {
		// 150,120
		initPlayer:function(x,y,color){
			var player = new Player(this.game);
			player.create(x,y,color);
			return player;
		},
		createBullets:function(){
			// Create an object pool of bullets
		    this.bulletPool = this.game.add.group();
		    var bitBullet=this.add.bitmapData(8,8);
		    bitBullet.ctx.beginPath();
		    bitBullet.ctx.rect(0,0,8,8);
		    //bitBullet.ctx.fillStyle = this.player._color;
		    bitBullet.ctx.fillStyle = '#ffffff';	
		    bitBullet.ctx.fill();

		    for(var i = 0; i < NUMBER_OF_BULLETS; i++) {
		        // Create each bullet and add it to the group.

		        var bullet = this.game.add.sprite(0, 0, bitBullet);
		        this.bulletPool.add(bullet);

		        // Set its pivot point to the center of the bullet
		        bullet.anchor.setTo(0.5, 0.5);

		        // Enable physics on the bullet
		        this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

		        // Set its initial state to "dead".
		        bullet.kill();
		    }
		},
			
		create: function () {
			this.physics.startSystem(Phaser.Physics.ARCADE);

			this.game.time.deltaCap=0.05;

			this.game.stage.disableVisibilityChange = true;
			
			this.game.input.keyboard.addKeyCapture([
				Phaser.Keyboard.W, Phaser.Keyboard.A,
				Phaser.Keyboard.S, Phaser.Keyboard.D
			]);


			
			



			var map = this.add.tilemap('main');
			map.addTilesetImage('Kenney 32x32', 'kenney32x32');

			map.layers.forEach(function(l){
				var layer=map.createLayer(l.name);
				if(l.name=='collision'){

				/*	var firstgid=map.tilesets[map.getTilesetIndex('zelda14')].firstgid;
					var slope={};
					for(var i=firstgid;i<firstgid+14;i++){
						slope[i.toString()]=i-firstgid;
						console.log(i+' '+(i-firstgid));

					}*/
/*
CUSTOM TILES
map.layers[1].data[6][3].intersects
!tile.intersects(body.position.x, body.position.y, body.right, body.bottom))
*/	
					console.log(l.name);
					map.setCollisionByExclusion([],true,layer);
					// l.name es 'ninjacollision'
					
					layer.debug = true;
				
					this.tilesCollision=layer;
					console.log(layer);
				}
				
				layer.resizeWorld();
			}, this);
			
			
    		this.game.time.advancedTiming = true;
    		this.fpsText = this.game.add.text(
      		  20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    		);
    		this.fpsText.fixedToCamera = true;

			this.game.stage.disableVisibilityChange = true;
			GameCtrl.remotePlayers=[];
			
			

			this.input.setMoveCallback(function(){
				if(this.input.mousePointer.isDown){
					if(this.input.mousePointer.button !==0){
						console.log(this.input.mousePointer.button);
						return ;
					}
					
					if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
					if (this.game.time.now - this.lastBulletShotAt < SHOT_DELAY) return;

					this.lastBulletShotAt = this.game.time.now;

					var angle=this.game.physics.arcade.angleToPointer(this.player);
					
					/*
					TODO SOCKET
					GameCtrl.socket.emit('fire',{angle:angle});
					*/

					this.drawBullet({x:this.player.x,y:this.player.y,angle:angle,color:this.player._color});
				}

			}, this);
			
		        
			this.realPlayer=this.initPlayer(Math.floor(Math.random()*600) + 100, 8);
			this.player = this.realPlayer.sprite;
			this.player.body.collideWorldBounds = true;
			this.player.body.gravity.set(0, GRAVITY);
			this.player.body.allowGravity = true;
			this.createBullets();

			this.DownActions = {
					//W
					87: this.realPlayer.jump.bind(this.realPlayer),
					//D
					68: this.realPlayer.goRight.bind(this.realPlayer), 
					//A
					65: this.realPlayer.goLeft.bind(this.realPlayer)
			}

			this.UpActions = {
					//A
					65: function() {
						if(this.input.keyboard.isDown(Phaser.Keyboard.D))
							this.realPlayer.goRight.call(this.realPlayer);
						else
							this.realPlayer.stop.call(this.realPlayer);
						},
					//D
					68: function() {
						if(this.input.keyboard.isDown(Phaser.Keyboard.A))
							this.realPlayer.goLeft.call(this.realPlayer);
						else
							this.realPlayer.stop.call(this.realPlayer);
						},
					//W
					87: this.realPlayer.stopJumping.bind(this.realPlayer)
			}
			
			this.input.keyboard.addCallbacks(this, function(ev) {
				if(ev.keyCode in this.DownActions)
					this.DownActions[ev.keyCode].call(this);
			}, function(ev) {
				if(ev.keyCode in this.UpActions)
				this.UpActions[ev.keyCode].call(this);
			});
			            
			
		},

		drawBullet:function(data){
			// Get a dead bullet from the pool
			var bullet = this.bulletPool.getFirstDead();

		    // If there aren't any bullets available then don't shoot
		    if (bullet === null || bullet === undefined) return;
			

		    // Revive the bullet
			// This makes the bullet "alive"
		    bullet.revive();

		    //bullet.tint=parseInt(data.color,16);
			
			// Bullets should kill themselves when they leave the world.
			// Phaser takes care of this for me by setting this flag
			// but you can do it yourself by killing the bullet if
			// its x,y coordinates are outside of the world.
			bullet.checkWorldBounds = true;
			bullet.outOfBoundsKill = true;


			// Set the bullet position to the gun position.
			bullet.reset(data.x, data.y);

			// Shoot it in the right direction
			bullet.body.velocity.x = Math.cos(data.angle) * BULLET_SPEED;
			bullet.body.velocity.y = Math.sin(data.angle) * BULLET_SPEED;

		},
		update: function () {
			if (this.game.time.fps !== 0) {
		        this.fpsText.setText(this.game.time.fps + ' FPS');
    		}

			this.physics.arcade.collide(this.player, this.tilesCollision, this.realPlayer.collideWall, null, this.realPlayer);




			var x=Math.floor(this.player.x);
			var y=Math.floor(this.player.y);
			if(x!=this.player.lastX || y!=this.player.lastY){
				/*
				TODO SOCKETS
				GameCtrl.socket.emit('move player', {x: Math.floor(this.player.x), y: Math.floor(this.player.y) });
				*/
			}

		},
		render: function(){
			this.game.debug.bodyInfo(this.player);
			this.game.debug.body(this.player);
		}
	};


	function Player(game){
	    this.game = game;
	    this.physics =game.physics;
	    this.add=game.add;
    	this.sprite = null;
    	this.cursors = null; 
	};
 
	Player.prototype = {
		create: function (x, y, color) {
			// create a new bitmap data object
			var bmd = this.add.bitmapData(32,32);

			if(!color) color=getRndColor();

			// draw to the canvas context like normal
			bmd.ctx.beginPath();
			bmd.ctx.rect(0,0,32,32);
			bmd.ctx.fillStyle =color;
			bmd.ctx.fill();

			var s = this.game.add.sprite(x, y, bmd);
			this.sprite = s;
			s._color=color;
			this.physics.enable(s,Phaser.Physics.ARCADE,true);
			s.anchor.set(0.5,0.5);
			s.lastX=Math.floor(x);
			s.lastY=Math.floor(y);
			s.body.maxVelocity.setTo(MAX_SPEED, MAX_SPEED_Y); // x, y
			s.body.drag.setTo(DRAG,0);

			this.game.camera.follow(s);
			this.jumping = false;
		},

		jump: function() {
			// Say how high!
			if(this.sprite.body.blocked.down || this.sprite.body.blocked.left || this.sprite.body.blocked.right){
				if(this.sprite.body.blocked.left)
					this.sprite.body.velocity.x = -this.sprite.body.velocity.x + 600;
				if(this.sprite.body.blocked.right)
					this.sprite.body.velocity.x = -this.sprite.body.velocity.x - 600;
				this.sprite.body.velocity.y=-YSPEED;
				this.jumping = true;
			}
		},

		stopJumping: function() {
			this.jumping = false;
		},

		goRight: function() {
			this.sprite.body.acceleration.x=MOVE_ACCELERATION;
		},

		stop: function() {
			this.sprite.body.velocity.x=0;
			this.sprite.body.acceleration.x=0;
		},

		goLeft: function() {
			this.sprite.body.acceleration.x=-MOVE_ACCELERATION;
		},

		collideWall: function(wall) {
			if(this.jumping) {
				this.jump()
			}
		}
	};


}());



