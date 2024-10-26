import {IFancySparklesSettings} from "types";

/**
 * This is the sprite-sheet image as base64, feel free to change the sprite-sheet with your own sprites.
 * Tip: if you wish to generate your own textures use shoebox or texture packer to package the assets, remember to put pixijs as output format and inline your base64 sprite-sheet and json data below.
 * Frames 0 to 6 are used for the animated sparkles, frames 7, 9 and 10 are used for bokeh and frame 9 is used for the stars
 */
export const sparkleSpriteSheet : string = "data:image/png;base64,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";

export const spriteSheetInfo = {
  frames:
  {
    "s1.png":
      {
        "frame": {"x": 98, "y": 112, "w": 37, "h": 35},
        "spriteSourceSize": {"x": 12, "y": 14, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s10.png":
      {
        "frame": {"x": 0, "y": 112, "w": 48, "h": 49},
        "spriteSourceSize": {"x": 8, "y": 8, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s2.png":
      {
        "frame": {"x": 49, "y": 112, "w": 48, "h": 41},
        "spriteSourceSize": {"x": 8, "y": 12, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s3.png":
      {
        "frame": {"x": 109, "y": 56, "w": 52, "h": 55},
        "spriteSourceSize": {"x": 5, "y": 5, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s4.png":
      {
        "frame": {"x": 0, "y": 0, "w": 56, "h": 55},
        "spriteSourceSize": {"x": 4, "y": 5, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s5.png":
      {
        "frame": {"x": 55, "y": 56, "w": 53, "h": 55},
        "spriteSourceSize": {"x": 5, "y": 5, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s6.png":
      {
        "frame": {"x": 111, "y": 0, "w": 37, "h": 35},
        "spriteSourceSize": {"x": 11, "y": 11, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s7.png":
      {
        "frame": {"x": 136, "y": 112, "w": 26, "h": 25},
        "spriteSourceSize": {"x": 18, "y": 19, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s8.png":
      {
        "frame": {"x": 0, "y": 56, "w": 54, "h": 54},
        "spriteSourceSize": {"x": 5, "y": 5, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      },
    "s9.png":
      {
        "frame": {"x": 57, "y": 0, "w": 53, "h": 55},
        "spriteSourceSize": {"x": 5, "y": 5, "w": 64, "h": 64},
        "sourceSize": {"w": 64, "h": 64}
      }
  },
  meta:
  {
    "image": this.sprites,
    "size": {"w": 163, "h": 162},
    "scale": "1"
  }
};

export const defaultFancySparklesSettings: IFancySparklesSettings = {
  sparkleColor: ["#ffffff", "#ffff00", "#e15ecb", "#32e187"],
  renderBokeh: false,
  renderSparkles: true,
  renderStars: true,
  sparkleScale: 50,
  speed: 2,
  minSize: 0.05,
  maxSize: 0.16,
  direction: "both",
  renderOutside: true,
  bokehColor: ["#ffffff", "#ffff00"],
  bokehScale: 1.5,
  bokehSize: 0.7,
  starScale: 2,
  starSize: 1,
  boundaryScale: 1,
  persistent: false,
};
