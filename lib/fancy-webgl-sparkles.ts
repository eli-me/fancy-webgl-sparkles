import * as pixi from "pixi.js";
import {defaultFancySparklesSettings} from "@/resources";

export class FancyWebGLSparklesEngine {
  private settings: IFancySparklesSettings;
  private element: Node[];
  private mouseEventElement: Event | undefined;


  constructor(element: Node[], inSettings: Partial<IFancySparklesSettings> = {}) {
    //if (!(element instanceof Node)) throw `Can't initialize FancyWebGLSparkles because ${element} is not a Node.`;
    this.settings = {
      ...defaultFancySparklesSettings,
      ...inSettings
    };

    for (let property in defaultFancySparklesSettings) {
      //Walk the Dom Tree of elements and find all the elements with the attribute "sparkle"
      let attrSetting = this.element.getAttribute("sparkle-" + property);

      //If this property exists in the user settings, set the object property to that setting, otherwise use the defaults
      if (property in inSettings) this.settings[property] = inSettings[property];

      else if (attrSetting != "" && attrSetting != null) {
        try {
          this.settings[property] = JSON.parse(attrSetting);
        } catch (e) {
          this.settings[property] = attrSetting;
        }
      } else this.settings[property] = this.getDefaultSettings()[property];
    }
    this.addEventListeners();
  }

  addEventListeners() {
    if (!this.settings.persistent) {
      this.element.addEventListener("mouseenter", (e) => {
        this.mouseEventElement = e;
        this.start(e.target);
      });
      this.element.addEventListener("mouseleave", () => {
        if (this.pixi === null || this.pixi === undefined) return;
        this.pixi.bIsPendingDestroy = true;
      });
      return;
    }
    this.start(this.element);
  }

  //Stop the pixi instance
  stop() {
    this.pixi.stop();
    this.pixi.bInstanceHasBeenInitialized = true;
  }

  start(element) {
    this.width = this.settings.renderOutside ? (this.element.getBoundingClientRect().width * 1.4) * this.settings.boundaryScale : this.element.getBoundingClientRect().width;
    this.height = this.settings.renderOutside ? (this.element.getBoundingClientRect().height * 1.4) * this.settings.boundaryScale : this.element.getBoundingClientRect().height;

    if (this.pixi === undefined) {
      this.pixi = new PIXI.Application({
        width: this.width, height: this.height, transparent: true, autoDensity: true, clearBeforeRender: true
      });
    }

    if (this.pixi.renderer.context.isLost) {
      this.pixi.destroy(true,
        {
          children: true,
          texture: false,
          baseTexture: false
        });
      this.pixi = new PIXI.Application({
        width: this.width, height: this.height, transparent: true, autoDensity: true, clearBeforeRender: true
      });
      this.pixi.bInstanceHasBeenInitialized = undefined;
    }

    //Append the pixi instance on top of the container and center with the help of css
    const pixiNode = element.appendChild(this.pixi.view);
    pixiNode.style.position = "absolute";
    pixiNode.style.left = "50%";
    pixiNode.style.top = "50%";
    pixiNode.style.transform = "translate(-50%, -50%)";

    //Add this property to later allow space for memory management once the particles are not being rendered on the screen
    this.pixi.bIsPendingDestroy = false;

    //We want to avoid any collisions between the canvas and the DOM
    pixiNode.style.pointerEvents = "none";

    //Find the parent and check if there's a stacking context to position the canvas on top of the element and not to the top of the root document, in our case we will set static DOM elements as relative to add the stacking context
    //https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
    const parentNode = window.getComputedStyle(element).position;
    if (parentNode === "static") element.style.position = "relative";

    //Add webgl filters
    const filter = new PIXI.filters.AdvancedBloomFilter(.05, 50, 4, 4, 4, null, 1, PIXI.settings.RESOLUTION);
    this.pixi.stage.filters = [filter];
    this.pixi.stage.filterArea = this.pixi.screen;

    //Load texture assets to the vRam cache pool if the cache is empty
    const spritesheetUrl = `data:application/json;base64,${btoa(JSON.stringify(this.spriteSheetData))}`;
    if (Object.keys(PIXI.utils.TextureCache).length === 0)
      this.pixi.loader.add("spritesheet", spritesheetUrl).load(() => this.onTexturesLoaded(false));

    else this.onTexturesLoaded(true);
  }

  //Construct the particles with its initial properties after the pixi instance and its textures have been allocated on memory
  onTexturesLoaded(bTexturesAlreadyOnMemory) {
    //If we have lost the context because we have hit webgl limits then we need to create the context again
    if (bTexturesAlreadyOnMemory && this.pixi.bInstanceHasBeenInitialized != undefined) {
      this.pixi.start();
      return;
    }

    const textureStore = [];
    const spriteStoreOne = [];
    const spriteStoreTwo = [];
    const spriteStoreThree = [];
    for (let i = 0; i < 10; ++i) textureStore.push(PIXI.Texture.from(`s${i + 1}.png`));
    //FadeIn the particles on creation for a nice smooth effect =)
    this.pixi.stage.alpha = 0;

    // create our sparkle sprite using the datauri supplied in the script
    const particleTypeOne = new PIXI.ParticleContainer(Math.round(this.settings.sparkleScale / 10 * this.settings.bokehScale), {
      scale: true,
      vertices: true,
      position: true,
      rotation: false,
      uvs: true,
      alpha: true
    });

    const particleTypeTwo = new PIXI.ParticleContainer(Math.round(this.settings.sparkleScale), {
      scale: true,
      vertices: true,
      position: true,
      rotation: false,
      uvs: true,
      alpha: true
    });

    const particleTypeThree = new PIXI.ParticleContainer(Math.round(this.settings.sparkleScale / 8 * this.settings.starScale), {
      scale: true,
      vertices: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    //This intermediate container is created to allow for webgl effects to be applied to the sparkle particles and get this nice glow effect.
    const particleContainerOne = new PIXI.Container();
    particleContainerOne.addChild(particleTypeTwo);

    const theFilter = new PIXI.filters.GlowFilter(10, 1, 0, PIXI.utils.string2hex("#ffffff"), .1);
    particleContainerOne.filters = [theFilter];
    particleContainerOne.filterArea = this.pixi.renderer.screen;

    //Create Bokeh Particles
    for (let i = 0; i < Math.round((this.settings.sparkleScale * 0.10) * this.settings.bokehScale); ++i) {
      const bokeh = Math.round(Math.random()) ? new PIXI.Sprite(textureStore[6]) : new PIXI.Sprite(textureStore[9]);
      bokeh.scale.set((Math.random() * (1.2 * this.settings.bokehSize)) + (0.4 * this.settings.bokehSize));
      bokeh.blendMode = PIXI.BLEND_MODES.OVERLAY;
      bokeh.tint = this.settings.bokehColor === "rainbow" ? Math.random() * 0xE8D4CD : PIXI.utils.string2hex(this.settings.bokehColor[Math.floor(Math.random() * this.settings.bokehColor.length)]);
      bokeh.x = Math.random() * this.pixi.screen.width;
      bokeh.y = Math.random() * this.pixi.screen.height;
      bokeh.anchor.set(0.5, 0.5);
      //Initial Fade state, fadeIn = 1, fadeOut = 0
      bokeh.fade = Math.round(Math.random());
      bokeh.alpha = this.clamp(Math.random(), 0.1, 0.7);
      spriteStoreOne.push(bokeh);
      particleTypeOne.addChild(bokeh);
    }

    //Create Sparkle Particles
    for (let i = 0; i < Math.round(this.settings.sparkleScale); ++i) {
      const sparkle = PIXI.AnimatedSprite.fromFrames(["s1.png", "s2.png", "s3.png", "s4.png", "s5.png", "s6.png", "s7.png"]);
      sparkle.tint = this.settings.sparkleColor === "rainbow" ? Math.random() * 0xE8D4CD : PIXI.utils.string2hex(this.settings.sparkleColor[Math.floor(Math.random() * this.settings.sparkleColor.length)]);
      sparkle.x = Math.random() * this.pixi.screen.width;
      sparkle.y = Math.random() * this.pixi.screen.height;
      sparkle.anchor.set(0.5, 0.5);
      sparkle.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
      sparkle.alpha = this.clamp(Math.random(), 0.3, 1);
      sparkle.fade = Math.round(Math.random());
      sparkle.rotation = Math.random() * Math.PI;
      sparkle.scale.set(this.clamp(Math.random() * this.settings.maxSize, this.settings.minSize, this.settings.maxSize));
      sparkle.gotoAndPlay(Math.floor(Math.random() * 6));
      sparkle.animationSpeed = .18;

      const xDirection = Math.floor(Math.random() * 20) - 10;
      const yDirection = this.settings.direction === "up" ? Math.floor(Math.random() * 5) - 5.5 : this.settings.direction === "down" ? Math.floor(Math.random() * 5) + .5 : Math.floor(Math.random() * 10) - 5;

      sparkle.direction =
        {
          //Add some randomness to the direction of movement on construction
          x: xDirection,
          y: yDirection
        };
      spriteStoreTwo.push(sparkle);
      particleTypeTwo.addChild(sparkle);
    }

    //Create Star Particles
    for (let i = 0; i < Math.round((this.settings.sparkleScale * .25) * this.settings.starScale); ++i) {
      const star = new PIXI.Sprite(textureStore[7]);
      star.tint = PIXI.utils.string2hex("#ffffff");
      star.x = Math.random() * this.pixi.screen.width;
      star.y = Math.random() * this.pixi.screen.height;
      star.anchor.set(0.5, 0.5);
      star.alpha = this.clamp(Math.random(), 0.3, 1);
      star.fade = Math.round(Math.random());
      star.rotation = Math.random() * Math.PI;
      star.zoom = Math.floor(Math.random());
      star.scale.set(this.clamp(Math.random() * this.settings.maxSize * 1.5, this.settings.minSize * 1.5, this.settings.maxSize * 1.5));

      const xDirection = Math.floor(Math.random() * 20) - 10;
      const yDirection = this.settings.direction === "up" ? Math.floor(Math.random() * 5) - 5.5 : this.settings.direction === "down" ? Math.floor(Math.random() * 5) + .5 : Math.floor(Math.random() * 10) - 5;

      star.direction =
        {
          //Add some randomness to the direction of movement on particle construction
          x: xDirection,
          y: yDirection
        };
      spriteStoreThree.push(star);
      particleTypeThree.addChild(star);
    }

    //Render particles based on user choice
    if (this.settings.renderBokeh) this.pixi.stage.addChild(particleTypeOne);
    if (this.settings.renderSparkles) this.pixi.stage.addChild(particleContainerOne);
    if (this.settings.renderStars) this.pixi.stage.addChild(particleTypeThree);

    //Initialize the update function
    this.pixi.ticker.add(() => {
      this.fadeInCanvas();
      this.fadeOutCanvas();
      if (this.pixi != null && !this.pixi.bIsPendingDestroy) this.update(spriteStoreOne, spriteStoreTwo, spriteStoreThree);
    });
  }

  //simple utility function used to matematically clamp diferent parameters
  clamp(value, min, max) {
    return value > max ? max : value < min ? min : value;
  }

  //FadeIn the content when the mouse enters the view
  fadeInCanvas() {
    if (this.pixi.stage.alpha >= 1 || this.pixi.bIsPendingDestroy) return;
    this.pixi.stage.alpha = this.clamp(this.pixi.stage.alpha, 0, 1);
    this.pixi.stage.alpha += 0.05 * this.pixi.ticker.deltaTime;
  }

  //FadeOut the content when the mouse gets out of the view before destroying the instance
  fadeOutCanvas() {
    if (this.pixi.stage.alpha == 0 && !this.pixi.bIsPendingDestroy) return;
    if (this.pixi.stage.alpha >= 0 && this.pixi.bIsPendingDestroy) {
      this.pixi.stage.alpha = this.clamp(this.pixi.stage.alpha, 0, 1);
      this.pixi.stage.alpha -= 0.08 * this.pixi.ticker.deltaTime;
    }
    if (this.pixi.stage.alpha <= 0 && this.pixi.bIsPendingDestroy) this.stop(this.mouseEventElement);
  }

  //Pulse the scale of the particle
  pulseParticle(particle, maxScale = 1.2, minScale = 0) {
    const theScale = particle.scale.x;
    //Similar to fading
    // 1 = Zoom In 0 = Zoom Out
    particle.zoom = (theScale >= maxScale && particle.zoom) ? 0 : (theScale <= minScale && !particle.zoom) ? 1 : particle.zoom;

    //zoom in
    if (particle.zoom) particle.scale.set(particle.scale.x + .003 * this.pixi.ticker.deltaTime);
    //zoom out
    if (!particle.zoom) particle.scale.set(particle.scale.x - .003 * this.pixi.ticker.deltaTime);

    //Clamp values to not allow negatives
    particle.scale.x = this.clamp(particle.scale.x, minScale, maxScale);
    particle.scale.y = this.clamp(particle.scale.y, minScale, maxScale);
  }

  //Fade In and out the particle, randomizing its position after it has been faded out
  fadeParticle(particle, maxOpacity = 0.6, newMinimumScale = .4, newMaximumScale = 1.2) {
    //Set particle fade state 1 = Fade In 0 = Fade Out
    particle.fade = (particle.alpha >= maxOpacity && particle.fade) ? 0 : (particle.alpha <= 0 && !particle.fade) ? 1 : particle.fade;

    //Fade in
    if (particle.fade) particle.alpha += .003 * this.pixi.ticker.deltaTime;

    //Fade out
    if (!particle.fade) particle.alpha -= .003 * this.pixi.ticker.deltaTime;

    //Clamp values to not allow negatives
    particle.alpha = this.clamp(particle.alpha, 0, maxOpacity);

    //Check if the particle has faded out, change its position
    if (!particle.fade && particle.alpha == 0) {
      particle.x = Math.random() * this.pixi.screen.width;
      particle.y = Math.random() * this.pixi.screen.height;
      particle.scale.set((Math.random() * (newMaximumScale - newMinimumScale)) + newMinimumScale);
    }
  }

  // Position particles at the other end of the canvas whenever they hit the bounds of the canvas itself
  // We also avoid clipping by setting a boundary based on the canvas size
  throwParticlesBackToTheCanvas(particle) {
    const boundingBox =
      {
        x: this.element.getBoundingClientRect().width,
        y: this.element.getBoundingClientRect().height
      };

    //Prevent clipping by providing an invisible boundary area for particles
    const bounds =
      {
        xMin: () => this.settings.renderOutside ? boundingBox.x * 0.1 : 0,
        xMax: () => this.settings.renderOutside ? this.width - (boundingBox.x * 0.1) : this.width,
        yMin: () => this.settings.renderOutside ? boundingBox.y * 0.1 : 0,
        yMax: () => this.settings.renderOutside ? this.height - (boundingBox.y * 0.1) : this.height,
      };

    if (particle.x > bounds.xMax() || particle.x < bounds.xMin() || particle.y > bounds.yMax() || particle.y < bounds.yMin()) {
      //Resize Particles if they are out of bounds
      particle.scale.set(this.clamp(Math.random() * this.settings.maxSize, this.settings.minSize, this.settings.maxSize));
    }

    if (particle.x > bounds.xMax()) particle.x = this.settings.renderOutside ? bounds.xMin : 0;
    if (particle.x < bounds.xMin()) particle.x = this.settings.renderOutside ? bounds.xMax : this.width;

    // if the particles have hit the vertical bounds, teleport them to a new X position with the y position inverted
    if (particle.y > bounds.yMax()) {
      particle.y = this.settings.renderOutside ? bounds.yMin : 0;
      particle.x = Math.floor(Math.random() * bounds.xMax);
    }
    if (particle.y < bounds.yMin()) {
      particle.y = this.settings.renderOutside ? bounds.yMax : this.height;
      particle.x = Math.floor(Math.random() * bounds.xMax);
    }
  }

  //Update loop on delta
  update(bokehs, sparkles, stars) {
    sparkles.forEach((sparkle) => {
      this.throwParticlesBackToTheCanvas(sparkle);
      this.fadeParticle(sparkle, 1, this.settings.minSize, this.settings.maxSize);

      // Randomly move stars along the direction, we weight x heavier than y,
      // allowing space for random decelleration, giving an ethereal floating feeling
      const speed =
        {
          x: () => {
            const randBool = Math.random() > Math.random() * 2;
            return randBool ? this.settings.speed / 20 : 0;
          },
          y: () => {
            const randBool = Math.random() > Math.random() * 5;
            return randBool ? this.settings.speed / 10 : this.settings.speed / 15;
          },
        };

      //Perform the position update
      sparkle.x += speed.x() * sparkle.direction.x * this.pixi.ticker.deltaTime;
      sparkle.y += speed.y() * sparkle.direction.y * this.pixi.ticker.deltaTime;
    });

    bokehs.forEach((bokeh) => {
      this.throwParticlesBackToTheCanvas(bokeh);
      this.fadeParticle(bokeh, 0.6, 0.4 * this.settings.bokehSize, 1.2 * this.settings.bokehSize);

      //Move the bokeh particle
      //The scale is going to be pumped on both the x and y axis at the same time, therefore we don't care of discrepancies between both axis to measure the current scale
      let currScale = bokeh.scale.x;
      currScale += 0.001 * this.pixi.ticker.deltaTime;
      bokeh.y -= (Math.random() * 0.2) * this.pixi.ticker.deltaTime;
      bokeh.scale.set(currScale);
    });

    stars.forEach((star) => {
      this.throwParticlesBackToTheCanvas(star);
      this.fadeParticle(star, 1, this.settings.minSize, this.settings.maxSize);

      //Perform the position update
      star.x += (this.settings.speed / 50 * star.direction.x) * this.pixi.ticker.deltaTime;
      star.y += (this.settings.speed / 30 * star.direction.y) * this.pixi.ticker.deltaTime;
      star.rotation += star.direction.y * this.pixi.ticker.deltaTime * Math.PI * .01;
      this.pulseParticle(star, this.settings.maxSize * 1.5, 0.1);
    });
  }
}
