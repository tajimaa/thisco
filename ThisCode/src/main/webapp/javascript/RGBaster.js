// import analyze from "rgbaster";

async function getMainColor(elementName) {
    const element = document.querySelector(elementName);
    const  result = await analyze(element);
    return result[0].color;
}