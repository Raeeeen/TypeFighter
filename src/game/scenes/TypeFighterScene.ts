import Phaser from "phaser";

export default class TypeFighterScene extends Phaser.Scene {
  private floor = 1;

  private player!: Phaser.GameObjects.Sprite;
  private playerContainer!: Phaser.GameObjects.Container;
  private playerHomeX = 0;
  private playerIsActing = false;
  private boss!: Phaser.GameObjects.Sprite;
  private bossContainer!: Phaser.GameObjects.Container;
  private bossRangedEffect?: Phaser.GameObjects.Sprite;
  private bossHomeX = 0;
  private bossIsActing = false;
  private specialAttackIndex = 0;

  private groundY = 0;
  private bossVisualTopPixel = 0;
  private bossVisualBottomPixel = 0;
  private playerVisualTopPixel = 0;
  private playerVisualBottomPixel = 0;

  private playerHP = 100;
  private bossHP = 100;

  private inputText!: Phaser.GameObjects.Text;

  private bossNameText!: Phaser.GameObjects.Text;
  private bossHPText!: Phaser.GameObjects.Text;
  private playerNameText!: Phaser.GameObjects.Text;
  private playerHPText!: Phaser.GameObjects.Text;
  private playerName = "PLAYER";

  private currentSentence = "Loading sentence...";
  private sentences: string[] = [];
  private onSentenceChange?: (sentence: string) => void;
  private onSceneReady?: (scene: TypeFighterScene) => void;
  private onFloorCleared?: () => void;
  private mistakeTriggeredForInput = false;

  private gameEnded = false;

  private currentMusic?: Phaser.Sound.BaseSound;

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
    this.floor = Phaser.Math.Clamp(data?.floor ?? 1, 1, 10);
    this.playerName = data?.playerName || "PLAYER";
    this.playerHP = Math.max(10, 110 - this.floor * 10);
    this.onSentenceChange = data?.onSentenceChange;
    this.onSceneReady = data?.onSceneReady;
    this.onFloorCleared = data?.onFloorCleared;
  }

  preload() {
    // BACKGROUND
    this.load.image(
      `background_${this.floor}`,
      `/assets/bosses/Floor${this.floor}/background.jpg`,
    );

    // PLAYER
    const playerPath = "/assets/characters/player";
    const playerFrame = { frameWidth: 128, frameHeight: 128 };

    this.load.spritesheet("player_idle", `${playerPath}/Idle.png`, playerFrame);
    this.load.spritesheet("player_walk", `${playerPath}/Walk.png`, playerFrame);
    this.load.spritesheet("player_hurt", `${playerPath}/Hurt.png`, playerFrame);
    this.load.spritesheet(
      "player_attack_1",
      `${playerPath}/Attack_1.png`,
      playerFrame,
    );
    this.load.spritesheet(
      "player_attack_2",
      `${playerPath}/Attack_2.png`,
      playerFrame,
    );
    this.load.spritesheet(
      "player_attack_3",
      `${playerPath}/Attack_3.png`,
      playerFrame,
    );

    // BOSS
    const bossPath = `/assets/bosses/Floor${this.floor}`;
    const bossFrame = { frameWidth: 128, frameHeight: 128 };

    this.load.spritesheet(
      `boss_${this.floor}_idle`,
      `${bossPath}/Idle.png`,
      bossFrame,
    );
    this.load.spritesheet(
      `boss_${this.floor}_walk`,
      `${bossPath}/Walk.png`,
      bossFrame,
    );
    this.load.spritesheet(
      `boss_${this.floor}_hurt`,
      `${bossPath}/Hurt.png`,
      bossFrame,
    );
    this.load.spritesheet(
      `boss_${this.floor}_attack_1`,
      `${bossPath}/Attack_1.png`,
      bossFrame,
    );
    if (this.hasAttack2Asset()) {
      this.load.spritesheet(
        `boss_${this.floor}_attack_2`,
        `${bossPath}/Attack_2.png`,
        bossFrame,
      );
    }
    if (this.hasAttack3Asset()) {
      this.load.spritesheet(
        `boss_${this.floor}_attack_3`,
        `${bossPath}/Attack_3.png`,
        bossFrame,
      );
    }

    if (this.floor === 6) {
      this.load.spritesheet(
        `boss_${this.floor}_fire_1`,
        `${bossPath}/Fire_1.png`,
        {
          frameWidth: 128,
          frameHeight: 64,
        },
      );
      this.load.spritesheet(
        `boss_${this.floor}_fire_2`,
        `${bossPath}/Fire_2.png`,
        {
          frameWidth: 128,
          frameHeight: 64,
        },
      );
    }

    if (this.floor === 7) {
      this.load.spritesheet(
        `boss_${this.floor}_charge_1`,
        `${bossPath}/Charge_1.png`,
        bossFrame,
      );
      this.load.spritesheet(
        `boss_${this.floor}_charge_2`,
        `${bossPath}/Charge_2.png`,
        bossFrame,
      );
    }

    // MUSIC
    this.load.audio(
      `battle_music_${this.floor}`,
      `/assets/bosses/Floor${this.floor}/soundtrack.mp3`,
    );

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
      .image(width / 2, height / 2, `background_${this.floor}`)
      .setDisplaySize(width, height);

    /*
     * MUSIC
     */

    this.currentMusic = this.sound.add(`battle_music_${this.floor}`, {
      loop: true,
      volume: 0.35,
    });
    this.currentMusic.play();

    this.groundY = height * 0.8;

    /*
     * BOSS
     */

    this.bossHomeX = width * 0.75;
    this.createBossAnimations();

    this.boss = this.add
      .sprite(0, 0, `boss_${this.floor}_idle`)
      .setScale(2)
      .setFlipX(true);

    this.boss.play(this.bossAnimationKey("idle"));

    const bossBounds = this.computeContentBounds(
      this.bossAnimationKey("idle"),
      128,
      128,
    );
    this.bossVisualTopPixel = bossBounds.top;
    this.bossVisualBottomPixel = bossBounds.bottom;

    const bossY = this.groundLineY(
      this.bossVisualBottomPixel,
      this.boss.scaleY,
    );

    this.bossContainer = this.add.container(this.bossHomeX, bossY, [this.boss]);

    if (this.floor === 6 || this.floor === 7) {
      this.bossRangedEffect = this.add
        .sprite(0, 0, this.bossSpecialAnimationKey(1))
        .setScale(2)
        .setFlipX(true)
        .setDepth(5)
        .setVisible(false);
    }

    /*
     * PLAYER
     */

    this.player = this.add.sprite(0, 0, "player_idle").setScale(2);
    this.createPlayerAnimations();
    this.player.play("player_idle");

    const playerBounds = this.computeContentBounds("player_idle", 128, 128);
    this.playerVisualTopPixel = playerBounds.top;
    this.playerVisualBottomPixel = playerBounds.bottom;

    const playerY = this.groundLineY(
      this.playerVisualBottomPixel,
      this.player.scaleY,
    );

    this.playerHomeX = width * 0.25;
    this.playerContainer = this.add.container(this.playerHomeX, playerY, [
      this.player,
    ]);

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
     * BOSS HUD
     */

    this.bossNameText = this.add
      .text(0, 0, "BOSS", {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.bossHPText = this.add
      .text(0, 0, "HP 100", {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ff6b6b",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.bossContainer.add([this.bossNameText, this.bossHPText]);

    /*
     * PLAYER HUD
     */

    this.playerNameText = this.add
      .text(0, 0, this.playerName, {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.playerHPText = this.add
      .text(0, 0, `HP ${this.playerHP}`, {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#a78bfa",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.playerContainer.add([this.playerNameText, this.playerHPText]);

    this.updateBossHudPosition();
    this.updatePlayerHudPosition();

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

  update() {
    if (this.boss && this.bossNameText && this.bossHPText) {
      this.updateBossHudPosition();
    }

    if (this.player && this.playerNameText && this.playerHPText) {
      this.updatePlayerHudPosition();
    }
  }

  private groundLineY(visualBottomPixel: number, scale: number): number {
    const frameHeight = 128;
    return this.groundY - (visualBottomPixel - frameHeight / 2) * scale;
  }

  private updateBossHudPosition() {
    const frameHeight = 128;
    const scale = this.boss.scaleY;

    const centeredTop = -frameHeight / 2 + this.bossVisualTopPixel;
    const bossTop = centeredTop * scale;

    this.bossNameText.setPosition(0, bossTop - 18);
    this.bossHPText.setPosition(0, bossTop - 2);
  }

  private updatePlayerHudPosition() {
    const frameHeight = 128;
    const scale = this.player.scaleY;

    const centeredTop = -frameHeight / 2 + this.playerVisualTopPixel;
    const playerTop = centeredTop * scale;

    this.playerNameText.setPosition(0, playerTop - 18);
    this.playerHPText.setPosition(0, playerTop - 2);
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

  private createPlayerAnimations() {
    const animations = [
      { name: "idle", frameRate: 12, repeat: -1 },
      { name: "walk", frameRate: 24, repeat: -1 },
      { name: "hurt", frameRate: 12, repeat: 0 },
      { name: "attack_1", frameRate: 14, repeat: 0 },
      { name: "attack_2", frameRate: 14, repeat: 0 },
      { name: "attack_3", frameRate: 14, repeat: 0 },
    ] as const;

    for (const animation of animations) {
      const key = `player_${animation.name}`;
      if (this.anims.exists(key)) continue;

      const texture = this.textures.get(key);
      const frameCount = texture
        .getFrameNames()
        .filter((name) => name !== "__BASE").length;

      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, {
          start: 0,
          end: frameCount - 1,
        }),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
  }

  private bossAnimationKey(
    animation: "idle" | "walk" | "hurt" | "attack_1" | "attack_2" | "attack_3",
  ) {
    return `boss_${this.floor}_${animation}`;
  }

  private hasAttack3Asset() {
    return [4, 5, 6, 10].includes(this.floor);
  }

  private hasAttack2Asset() {
    return [4, 5, 6, 7, 8, 9, 10].includes(this.floor);
  }

  private bossSpecialAnimationKey(index: 1 | 2) {
    return this.floor === 6
      ? `boss_${this.floor}_fire_${index}`
      : `boss_${this.floor}_charge_${index}`;
  }

  private computeContentBounds(
    key: string,
    frameWidth: number,
    frameHeight: number,
    widthThresholdRatio = 0.2,
  ): { top: number; bottom: number } {
    const fallback = { top: 0, bottom: frameHeight - 1 };

    try {
      const texture = this.textures.get(key);
      const source = texture.getSourceImage(0) as
        | HTMLImageElement
        | HTMLCanvasElement;

      const canvas = document.createElement("canvas");
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return fallback;

      ctx.drawImage(
        source as CanvasImageSource,
        0,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight,
      );

      const { data } = ctx.getImageData(0, 0, frameWidth, frameHeight);

      const rowMaxRuns: number[] = [];
      let overallMaxRun = 0;

      for (let y = 0; y < frameHeight; y++) {
        let run = 0;
        let maxRun = 0;

        for (let x = 0; x < frameWidth; x++) {
          const alpha = data[(y * frameWidth + x) * 4 + 3];

          if (alpha > 10) {
            run++;
            maxRun = Math.max(maxRun, run);
          } else {
            run = 0;
          }
        }

        rowMaxRuns.push(maxRun);
        overallMaxRun = Math.max(overallMaxRun, maxRun);
      }

      if (overallMaxRun === 0) return fallback;

      const threshold = overallMaxRun * widthThresholdRatio;

      let top = 0;
      for (let y = 0; y < frameHeight; y++) {
        if (rowMaxRuns[y] >= threshold) {
          top = y;
          break;
        }
      }

      let bottom = frameHeight - 1;
      for (let y = frameHeight - 1; y >= 0; y--) {
        if (rowMaxRuns[y] >= threshold) {
          bottom = y;
          break;
        }
      }

      return { top, bottom };
    } catch (err) {
      console.warn(`Failed to compute content bounds for ${key}:`, err);
      return fallback;
    }
  }

  private createBossAnimations() {
    const animations = [
      { name: "idle", frameRate: 12, repeat: -1 },
      { name: "walk", frameRate: 30, repeat: -1 },
      { name: "hurt", frameRate: 10, repeat: 0 },
      { name: "attack_1", frameRate: 12, repeat: 0 },
      { name: "attack_2", frameRate: 12, repeat: 0 },
      { name: "attack_3", frameRate: 12, repeat: 0 },
    ] as const;

    for (const animation of animations) {
      if (animation.name === "attack_2" && !this.hasAttack2Asset()) {
        continue;
      }

      if (animation.name === "attack_3" && !this.hasAttack3Asset()) {
        continue;
      }

      const key = this.bossAnimationKey(animation.name);
      if (this.anims.exists(key)) continue;

      const texture = this.textures.get(key);
      const frameCount = texture
        .getFrameNames()
        .filter((name) => name !== "__BASE").length;

      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, {
          start: 0,
          end: frameCount - 1,
        }),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }

    if (this.floor === 6 || this.floor === 7) {
      for (const index of [1, 2] as const) {
        const key = this.bossSpecialAnimationKey(index);
        const texture = this.textures.get(key);
        const frameCount = texture
          .getFrameNames()
          .filter((name) => name !== "__BASE").length;

        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(key, {
            start: 0,
            end: frameCount - 1,
          }),
          frameRate: 18,
          repeat: 0,
        });
      }
    }
  }

  private playRangedAttack() {
    if (!this.bossRangedEffect || this.gameEnded) return;

    this.specialAttackIndex = this.specialAttackIndex === 0 ? 1 : 0;
    const effectIndex = (this.specialAttackIndex + 1) as 1 | 2;
    const effectKey = this.bossSpecialAnimationKey(effectIndex);
    const startX = this.bossContainer.x - 120;
    const targetX = this.playerContainer.x - 80;

    this.bossRangedEffect
      .setPosition(startX, this.playerContainer.y - 20)
      .setTexture(effectKey)
      .setVisible(true)
      .play(effectKey);

    this.tweens.add({
      targets: this.bossRangedEffect,
      x: targetX,
      duration: 150,
      onComplete: () => {
        this.bossRangedEffect?.setVisible(false);
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

  public setMusicVolume(volume: number) {
    if (this.currentMusic && "setVolume" in this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(volume);
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

    if (!this.playerIsActing) {
      this.playerIsActing = true;
      this.player.play("player_walk");

      const attackX = Math.max(
        this.playerHomeX + 180,
        this.bossContainer.x - 150,
      );
      this.tweens.add({
        targets: this.playerContainer,
        x: attackX,
        duration: 250,
        onComplete: () => {
          if (!this.player || this.gameEnded) return;

          const attack = Phaser.Math.Between(1, 3);
          this.player.play(`player_attack_${attack}`);
          this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (!this.player || this.gameEnded) return;

            this.player.play("player_walk");
            this.tweens.add({
              targets: this.playerContainer,
              x: this.playerHomeX,
              duration: 250,
              onComplete: () => {
                if (!this.player || this.gameEnded) return;

                this.playerIsActing = false;
                this.player.play("player_idle");
              },
            });
          });
        },
      });
    }

    this.boss.play(this.bossAnimationKey("hurt"));
    this.time.delayedCall(350, () => {
      if (!this.boss || this.gameEnded || this.bossIsActing) return;

      this.boss.play(this.bossAnimationKey("idle"));
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

    if (this.bossIsActing) {
      this.player.play("player_hurt");
      this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (!this.player || this.gameEnded) return;
        this.player.play("player_idle");
      });
      return;
    }

    this.bossIsActing = true;
    this.boss.play(this.bossAnimationKey("walk"));

    const isRangedBoss = this.floor === 6 || this.floor === 7;
    const attackX = isRangedBoss
      ? Math.max(this.playerContainer.x + 260, this.bossHomeX - 320)
      : Math.min(this.bossHomeX - 180, this.playerContainer.x + 150);

    this.tweens.add({
      targets: this.bossContainer,
      x: attackX,
      duration: 250,
      onComplete: () => {
        if (!this.boss || this.gameEnded) return;

        const availableAttacks = ([1, 2, 3] as const).filter((index) =>
          this.anims.exists(this.bossAnimationKey(`attack_${index}`)),
        );
        const attack = Phaser.Utils.Array.GetRandom(availableAttacks);

        if (attack === undefined) return;

        this.boss.play(this.bossAnimationKey(`attack_${attack}`));
        this.playRangedAttack();
      },
    });

    this.time.delayedCall(400, () => {
      if (!this.boss || this.gameEnded) return;

      this.playerHP = Math.max(0, this.playerHP - 10);
      this.playerHPText.setText(`HP ${this.playerHP}`);

      this.player.play("player_hurt");
      this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (!this.player || this.gameEnded) return;
        this.player.play("player_idle");
      });

      if (this.playerHP <= 0) {
        this.gameOver();
        return;
      }
    });

    this.time.delayedCall(550, () => {
      if (!this.boss || this.gameEnded) return;

      this.boss.play(this.bossAnimationKey("walk"));
      this.tweens.add({
        targets: this.bossContainer,
        x: this.bossHomeX,
        duration: 250,
        onComplete: () => {
          if (!this.boss || this.gameEnded) return;

          this.bossIsActing = false;
          this.boss.play(this.bossAnimationKey("idle"));
        },
      });
    });
  }

  /*
   * FLOOR CLEARED
   */

  private floorCleared() {
    if (this.gameEnded) return;

    this.gameEnded = true;

    this.bossRangedEffect?.setVisible(false);

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

    this.bossRangedEffect?.setVisible(false);

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
      .text(this.scale.width / 2, this.scale.height / 2 + 85, "↻ RETRY", {
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
      })
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
