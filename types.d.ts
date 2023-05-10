type SparkleDirection = "up" | "down" | "both";

interface IFancySparklesSettings {
    // colors to use for the sparkles
    sparkleColor: Array<string>;
    // rendering controls allow you to enable or disable bokeh, sparkles or stars
    renderBokeh: boolean;
    renderSparkles: boolean;
    renderStars: boolean;
    // sparkle particle count
    sparkleScale: number;
    // simulation speed
    speed: number;
    // minimum particle size
    minSize: number;
    // maximum particle size
    maxSize: number;
    // direction of sparkle particles, you can use up, down or both
    direction: SparkleDirection;
    // if set to true allows particles to render outside from the element's bounding box
    renderOutside: boolean;
    // array of colours for the bokeh effect
    bokehColor: Array<string>;
    // this scale is proportional to the number of sparkles on the screen to avoid pollution
    bokehScale: number;
    // size multiplier to scale the bokeh, IE a scale of two means double the size
    bokehSize: number;
    // this scale is proportional to the number of sparkles on the screen
    starScale: number;
    // size multiplier to scale the star particles, IE a scale of two means double the original size
    starSize: number;
    // scale of the boundary if renderOutside is set to true, IE a value of 2 would double the size of the area that is being rendered outside of the parent element boundaries.
    boundaryScale: number;
    // if this setting is true the particles will start rendering as soon as the DOM is generated.
    persistent: boolean;
}

interface Frame {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface SpriteSourceSize {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface SourceSize {
    w: number;
    h: number;
}

interface SpriteInfo {
    frame: Frame;
    spriteSourceSize: SpriteSourceSize;
    sourceSize: SourceSize;
}

interface Meta {
    image: string;
    size: SourceSize;
    scale: string;
}

interface SpriteSheetInfo {
    frames: Record<string, SpriteInfo>;
    meta: Meta;
}

// export const spriteSheetInfo: SpriteSheetInfo = {
//     // Your object content goes here
// };
