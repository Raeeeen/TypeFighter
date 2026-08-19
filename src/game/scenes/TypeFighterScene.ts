import Phaser from "phaser";

export default class TypeFighterScene extends Phaser.Scene {
  private floor = 1;

  private player!: Phaser.GameObjects.Sprite;
  private boss!: Phaser.GameObjects.Sprite;

  private playerHP = 100;
  private bossHP = 100;

  private wordText!: Phaser.GameObjects.Text;
  private inputText!: Phaser.GameObjects.Text;

  private playerHPText!: Phaser.GameObjects.Text;
  private bossHPText!: Phaser.GameObjects.Text;

  private currentWord = "warrior";

  private playerIdleTimer?: Phaser.Time.TimerEvent;
  private bossIdleTimer?: Phaser.Time.TimerEvent;

  private gameEnded = false;

  constructor() {
    super("TypeFighterScene");
  }

  init(data: { floor?: number }) {
    this.floor = data?.floor ?? 1;
  }

  preload() {
    // =========================
    // BACKGROUND
    // =========================

    this.load.image("background", "/assets/background/background.webp");

    // =========================
    // PLAYER
    // =========================

    this.load.image("player_idle1", "/assets/characters/player/idle1.webp");

    this.load.image("player_idle2", "/assets/characters/player/idle2.webp");

    this.load.image("player_attack1", "/assets/characters/player/attack1.webp");

    this.load.image("player_attack2", "/assets/characters/player/attack2.webp");

    // =========================
    // BOSS
    // =========================

    this.load.image("boss_idle1", "/assets/bosses/idle1.webp");

    this.load.image("boss_idle2", "/assets/bosses/idle2.webp");

    this.load.image("boss_attack1", "/assets/bosses/attack1.webp");

    this.load.image("boss_attack2", "/assets/bosses/attack2.webp");

    // =========================
    // MUSIC
    // =========================

    this.load.audio("battle_music", "/assets/audio/battlemusic.mp3");
  }

  create() {
    const { width, height } = this.scale;

    /*
     * BACKGROUND
     */

    this.add
      .image(width / 2, height / 2, "background")
      .setDisplaySize(width, height);

    /*
     * MUSIC
     */

    this.sound.play("battle_music", {
      loop: true,
      volume: 0.35,
    });

    /*
     * PLAYER
     */

    this.player = this.add
      .sprite(width * 0.25, height * 0.65, "player_idle1")
      .setScale(0.5);

    /*
     * BOSS
     */

    this.boss = this.add
      .sprite(width * 0.75, height * 0.65, "boss_idle1")
      .setScale(0.5);

    /*
     * IDLE EFFECT
     */

    this.startIdleAnimations();

    /*
     * FLOOR
     */

    this.add
      .text(width / 2, 35, `FLOOR ${this.floor}`, {
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    /*
     * BOSS
     */

    this.add
      .text(width * 0.75, height * 0.48, "BOSS", {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.bossHPText = this.add
      .text(width * 0.75, height * 0.52, "HP 100", {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ff6b6b",
      })
      .setOrigin(0.5);

    /*
     * PLAYER
     */

    this.add
      .text(width * 0.25, height * 0.48, "PLAYER", {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.playerHPText = this.add
      .text(width * 0.25, height * 0.52, "HP 100", {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#a78bfa",
      })
      .setOrigin(0.5);

    // Word label and current word are intentionally not shown on the Phaser
    // canvas; input is handled via the DOM input in the React UI.

    /*
     * INPUT
     */

    this.inputText = this.add
      .text(width / 2, height * 0.38, "", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#a78bfa",
      })
      .setOrigin(0.5);

    /*
     * KEYBOARD
     */

    this.input.keyboard?.on("keydown", this.handleKey, this);
  }

  /*
   * SIMPLE IDLE ANIMATION
   *
   * We just swap idle1 / idle2.
   */

  private startIdleAnimations() {
    let playerFrame = false;
    let bossFrame = false;

    this.playerIdleTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.player || this.gameEnded) return;

        playerFrame = !playerFrame;

        this.player.setTexture(playerFrame ? "player_idle2" : "player_idle1");
      },
    });

    this.bossIdleTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.boss || this.gameEnded) return;

        bossFrame = !bossFrame;

        this.boss.setTexture(bossFrame ? "boss_idle2" : "boss_idle1");
      },
    });
  }

  /*
   * KEYBOARD INPUT
   */

  private handleKey(event: KeyboardEvent) {
    if (this.gameEnded) return;

    if (event.key === "Backspace") {
      this.inputText.text = this.inputText.text.slice(0, -1);

      return;
    }

    if (event.key === "Enter") {
      this.checkWord();
      return;
    }

    if (event.key.length === 1) {
      this.inputText.text += event.key;
    }
  }

  /*
   * CHECK WORD
   */

  private checkWord() {
    const typed = this.inputText.text;

    if (!typed) {
      return;
    }

    if (typed === this.currentWord) {
      this.damageBoss();
    } else {
      this.damagePlayer();
    }

    this.inputText.text = "";
  }

  // Expose methods for external input (DOM) to interact with the scene
  public setInputText(text: string) {
    if (this.inputText) {
      this.inputText.setText(text);
    }
  }

  public submitInput() {
    this.checkWord();
  }

  /*
   * PLAYER ATTACK
   */

  private damageBoss() {
    if (this.gameEnded) return;

    this.player.setTexture("player_attack1");

    this.time.delayedCall(100, () => {
      if (!this.player || this.gameEnded) return;

      this.player.setTexture("player_attack2");
    });

    this.time.delayedCall(200, () => {
      if (!this.player || this.gameEnded) return;

      this.player.setTexture("player_idle1");
    });

    this.bossHP -= 20;

    if (this.bossHP < 0) {
      this.bossHP = 0;
    }

    this.bossHPText.setText(`HP ${this.bossHP}`);

    if (this.bossHP <= 0) {
      this.floorCleared();
    }
  }

  /*
   * BOSS ATTACK
   */

  private damagePlayer() {
    if (this.gameEnded) return;

    this.boss.setTexture("boss_attack1");

    this.time.delayedCall(100, () => {
      if (!this.boss || this.gameEnded) return;

      this.boss.setTexture("boss_attack2");
    });

    this.time.delayedCall(200, () => {
      if (!this.boss || this.gameEnded) return;

      this.boss.setTexture("boss_idle1");
    });

    this.playerHP -= 20;

    if (this.playerHP < 0) {
      this.playerHP = 0;
    }

    this.playerHPText.setText(`HP ${this.playerHP}`);

    if (this.playerHP <= 0) {
      this.gameOver();
    }
  }

  /*
   * FLOOR CLEARED
   */

  private floorCleared() {
    if (this.gameEnded) return;

    this.gameEnded = true;

    this.input.keyboard?.removeListener("keydown", this.handleKey, this);

    this.playerIdleTimer?.remove();
    this.bossIdleTimer?.remove();

    this.sound.stopAll();

    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.7,
    );

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 40, "FLOOR CLEARED", {
        fontFamily: "Arial",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#a78bfa",
      })
      .setOrigin(0.5);

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 30,
        `Floor ${this.floor} defeated`,
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    /*
     * Back to floor selection
     */

    const button = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 90,
        "← BACK TO FLOORS",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#a78bfa",
          backgroundColor: "#15121f",
          padding: {
            left: 20,
            right: 20,
            top: 12,
            bottom: 12,
          },
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      window.location.href = "/solo";
    });
  }

  /*
   * GAME OVER
   */

  private gameOver() {
    if (this.gameEnded) return;

    this.gameEnded = true;

    this.input.keyboard?.removeListener("keydown", this.handleKey, this);

    this.playerIdleTimer?.remove();
    this.bossIdleTimer?.remove();

    this.sound.stopAll();

    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.7,
    );

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 40, "DEFEATED", {
        fontFamily: "Arial",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#ff4444",
      })
      .setOrigin(0.5);

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 30,
        "The boss has defeated you.",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    const button = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 90,
        "← BACK TO FLOORS",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#a78bfa",
          backgroundColor: "#15121f",
          padding: {
            left: 20,
            right: 20,
            top: 12,
            bottom: 12,
          },
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      window.location.href = "/solo";
    });
  }
}
