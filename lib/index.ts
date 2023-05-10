export const FancyWebGLSparkles =
{
  install(app, options)
  {

  },
  //Static Constructor TODO:
  init(elements, settings)
  {
    if (elements instanceof Node) elements = [elements];
    if (elements instanceof NodeList) elements = [].slice.call(elements);
    if (!(elements instanceof Array)) return;

    elements.forEach(element => {
      if (!("FancyWebGLSparkles" in element)) element.FancyWebGLSparkles = new FancyWebGLSparkles(element, settings);
    });
  }
}
