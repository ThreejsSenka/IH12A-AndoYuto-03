const sceneName = new URLSearchParams(window.location.search).get("scene");

if (sceneName === "mirai") {
    import("./mirai.js");
} else if (sceneName === "siranai") {
    import("./siranai.js");
} else {
    import("./taiyoukei.js");
}
