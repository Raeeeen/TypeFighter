import Phaser from "phaser";

export default class TypeFighterScene extends Phaser.Scene {
  private floor = 1;

  private player!: Phaser.GameObjects.Sprite;
  private boss!: Phaser.GameObjects.Sprite;

  private playerHP = 100;
  private bossHP = 100;

  private inputText!: Phaser.GameObjects.Text;

  private playerHPText!: Phaser.GameObjects.Text;
  private bossHPText!: Phaser.GameObjects.Text;
  private playerName = "PLAYER";

  private currentSentence = "Loading sentence...";
  private sentences: string[] = [];
  private onSentenceChange?: (sentence: string) => void;
  private onSceneReady?: (scene: TypeFighterScene) => void;
  private onFloorCleared?: () => void;
  private mistakeTriggeredForInput = false;

  private playerIdleTimer?: Phaser.Time.TimerEvent;
  private bossIdleTimer?: Phaser.Time.TimerEvent;

  private gameEnded = false;

  constructor() {
    super("TypeFighterScene");
  }

  init(data: {
    floor?: number;
    playerName?: string;
    onSentenceChange?: (sentence: string) => void;
    onSceneReady?: (scene: TypeFighterScene) => void;
    onFloorCleared?: () => void;
  }) {
    this.floor = data?.floor ?? 1;
    this.playerName = data?.playerName || "PLAYER";
    this.playerHP = Math.max(10, 110 - this.floor * 10);
    this.onSentenceChange = data?.onSentenceChange;
    this.onSceneReady = data?.onSceneReady;
    this.onFloorCleared = data?.onFloorCleared;
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

    this.load.text("sentences", "/assets/sentence/sentences.txt");
  }

  create() {
    const { width, height } = this.scale;

    this.sentences = this.cache.text
      .get("sentences")
      .split(/\r?\n/)
      .map((sentence: string) => sentence.trim())
      .filter((sentence: string) => sentence.length > 0);

    this.chooseSentence();

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
      .text(width * 0.25, height * 0.48, this.playerName, {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.playerHPText = this.add
      .text(width * 0.25, height * 0.52, `HP ${this.playerHP}`, {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#a78bfa",
      })
      .setOrigin(0.5);

    // Word label and current word are intentionally not shown on the Phaser
    // canvas; input is handled via the DOM input in the React UI.

    this.inputText = this.add
      .text(width / 2, height * 0.38, "", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#a78bfa",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.onSceneReady?.(this);
  }

  private chooseSentence() {
    if (this.sentences.length === 0) {
      this.currentSentence = "The next battle begins now.";
    } else {
      const randomIndex = Math.floor(Math.random() * this.sentences.length);
      this.currentSentence = this.sentences[randomIndex];
    }

    this.onSentenceChange?.(this.currentSentence);
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

  /* CHECK WORD */

  private checkWord(): boolean {
    const rawTyped = this.inputText.text;
    const typed = this.normalize(rawTyped);
    const target = this.normalize(this.currentSentence);

    if (!typed) {
      return false;
    }

    const isCorrect = typed === target;

    if (isCorrect) {
      this.damageBoss();
    } else if (!this.mistakeTriggeredForInput) {
      this.damagePlayer();
    }

    if (isCorrect) {
      this.inputText.text = "";
    }

    return isCorrect;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"');
  }

  // Expose methods for external input (DOM) to interact with the scene
  public setInputText(text: string) {
    if (this.inputText) {
      this.inputText.setText(text);

      if (
        !text ||
        this.normalize(text) === this.normalize(this.currentSentence)
      ) {
        this.mistakeTriggeredForInput = false;
      }
    }
  }

  public handleTypingMistake() {
    if (this.gameEnded) return;

    this.mistakeTriggeredForInput = true;
    this.damagePlayer();
  }

  public submitInput(text: string): boolean {
    this.setInputText(text);
    return this.checkWord();
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

    this.bossHP -= 10;

    if (this.bossHP < 0) {
      this.bossHP = 0;
    }

    this.bossHPText.setText(`HP ${this.bossHP}`);

    this.mistakeTriggeredForInput = false;
    this.chooseSentence();

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

    this.playerHP -= 10;

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

    this.playerIdleTimer?.remove();
    this.bossIdleTimer?.remove();

    this.sound.stopAll();
    this.onFloorCleared?.();

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

    const retryButton = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 85,
        "↻ RETRY",
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

    retryButton.on("pointerdown", async () => {
      try {
        const response = await fetch("/api/profile/runs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ floor: this.floor }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) return;
      } catch {
        return;
      }

      window.location.reload();
    });

    const button = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 145,
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
