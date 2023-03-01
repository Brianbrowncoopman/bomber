var config = {
  type: Phaser.AUTO, //Phaser.CANVAS Phaser.WEBGL
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload, //carga antes del juego
    create: create, //añadir plataforma fondo
    update: update, //actualiza cada segundo segun movimiento
  },
};

var score = 0;
var scoreText;
var gameOver = false;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/sky.jpg"); ///ojo con la carga de imagenes deben ser png
  this.load.image("platform", "assets/platform.jpg");
  this.load.image("star", "assets/star.jpg");
  this.load.image("bomb", "assets/bomb.jpg");
  this.load.spritesheet("dude", "assets/dude.jpg", {
    //sprite= fotorama 9
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(400, 300, "sky"); //ancho y alto de la imagen/propiedades dividido en 2 ancho y alto

  platforms = this.physics.add.staticGroup(); //crea grupo de elementos estaticos con fisica  dinamico o estatico

  platforms.create(400, 568, "platform").setScale(2).refreshBody(); ///piso

  platforms.create(600, 400, "platform");
  platforms.create(50, 250, "platform");
  platforms.create(750, 220, "platform");

  player = this.physics.add.sprite(100, 450, "dude"); //donde inicia

  player.setCollideWorldBounds(true); //limites
  player.setBounce(0.4);

  this.anims.create({
    //animacion a la izquierda
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }), //fotoramas
    frameRate: 10, //fotoramas por segundo
    repeat: -1, //cuando termine inicia nuevamente
  });

  this.anims.create({
    //animacion girar
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20, //totoramas por segundo
  });

  this.anims.create({
    //animacion a la derecha
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }), //fotoramas
    frameRate: 10, //totoramas por segundo
    repeat: -1, //cuando termine inicia nuevamente
  });

  //player.body.setGravityY(300); //peso con el que cae el personaje

  this.physics.add.collider(player, platforms); //collider detecta contacto entre player y platform

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }, //como se distribuyen las estrellas
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); //rango de rebote de estrellas aleatoreo entre 0,4 y 0,8
  });

  this.physics.add.collider(stars, platforms); //para que las estrella colisionen

  this.physics.add.overlap(player, stars, colectStar, null, true);

  scoreText = this.add.text(16, 16, "Score: 0", {
    //marcador
    fontSize: "32px",
    fill: "#000",
  });

  bombs = this.physics.add.group(); //grupo de bombas

  this.physics.add.collider(bombs, platforms); //bombas rebotan en plataforma
  this.physics.add.collider(player, bombs, hitBomb, null, this); //bombas colicionan con el jugador
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    //si la flecha izquierda es apretada
    player.setVelocityX(-160); //izquierda -  derecha +
    player.anims.play("left", true); //inicia animacion izquierda
  } else if (cursors.right.isDown) {
    //si la flecha derecha es apretada
    player.setVelocityX(160);
    player.anims.play("right", true); //inicia animacion a la derecha
  } else {
    player.setVelocityX(0);
    player.anims.play("turn"); //inicia animacion al frente soluciona el bug de movimiento continuo
  }

  if (cursors.up.isDown && player.body.touching.down) {
    //si la tecla arriba esta presionada
    player.setVelocityY(-330); //velocidad del salto
  }
}

function colectStar(player, star) {
  //para recolectar estrellas
  star.disableBody(true, true);

  score += 10; //valor por estrella colicionada
  scoreText.setText("Score: " + score); //valor en pantalla

  if (stars.countActive(true) === 0) {
    //cuando las estrellas son igual a o
    stars.children.iterate(function (child) {
      //se lanzan nuevamente las estrellas
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400); //distancia donde caen las bombas

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}
