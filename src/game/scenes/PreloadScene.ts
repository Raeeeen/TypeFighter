import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Background
    this.load.image(
      "background",
      "/game/background.webp"
    );

    // Player
    this.load.image(
      "player-idle1",
      "/game/player/idle1.webp"
    );

    this.load.image(
      "player-idle2",
      "/game/player/idle2.webp"
    );

    this.load.image(
      "player-attack1",
      "/game/player/attack1.webp"
    );

    this.load.image(
      "player-attack2",
      "/game/player/attack2.webp"
    );

    // Boss
    this.load.image(
      "boss-idle1",
      "/game/bosses/idle1.webp"
    );

    this.load.image(
      "boss-idle2",
      "/game/bosses/idle2.webp"
    );

    this.load.image(
      "boss-attack1",
      "/game/bosses/attack1.webp"
    );

    this.load.image(
      "boss-attack2",
      "/game/bosses/attack2.webp"
    );

    // Music
    this.load.audio(
      "battle-music",
      "/game/audio/battlemusic.mp3"
    );
  }

  create() {
    this.scene.start("GameScene");
  }
}