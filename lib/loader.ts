import { FancyWebGLSparkles } from "@/fancy-webgl-sparkles";

if (typeof document !== "undefined")
{
    /* expose the class to window and autoload */
    window.FancyWebGLSparkles = FancyWebGLSparkles;
    FancyWebGLSparkles.init(document.querySelectorAll("[sparkle]"));
}
