import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    // Background
    this.add
      .image(640, 360, "background")
      .setDisplaySize(1280, 720);

    // Player
    this.add
      .image(350, 500, "player-idle1")
      .setScale(0.5);

    // Boss
    this.add
      .image(930, 500, "boss-idle1")
      .setScale(0.5);

    // Title
    this.add
      .text(640, 50, "FLOOR 1", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Music
    const music = this.sound.add("battle-music", {
      loop: true,
      volume: 0.4,
    });

    music.play();
  }
}