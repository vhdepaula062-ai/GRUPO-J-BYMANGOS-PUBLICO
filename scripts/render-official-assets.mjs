import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Definindo os elementos SVG oficiais da marca Grupo J
const SVG_SYMBOL = (size = 300) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M38 6 H80 C91 6 94 9 94 20 V80 C94 91 91 94 80 94 H20 C9 94 6 91 6 80 V38 L38 6 Z" fill="#034EFE" />
  <path d="M48 24 H62 V64 C62 70 58 74 50 74 H42 C34 74 30 70 30 64 V56 H42 V62 H50 V36 H48 V24 Z" fill="#FFFFFF" />
  <path d="M30 46 L42 36 V48 L30 58 V46 Z" fill="#FFFFFF" />
</svg>
`;

const SVG_SPLASH_CONTENT = (symbolSize = 160) => `
<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;">
  <svg width="${symbolSize}" height="${symbolSize}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 6 H80 C91 6 94 9 94 20 V80 C94 91 91 94 80 94 H20 C9 94 6 91 6 80 V38 L38 6 Z" fill="#034EFE" />
    <path d="M48 24 H62 V64 C62 70 58 74 50 74 H42 C34 74 30 70 30 64 V56 H42 V62 H50 V36 H48 V24 Z" fill="#FFFFFF" />
    <path d="M30 46 L42 36 V48 L30 58 V46 Z" fill="#FFFFFF" />
  </svg>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 38px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
      GRUPO J
    </span>
    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 4px; color: #034EFE; text-transform: uppercase;">
      CLUBE DE BENEFÍCIOS
    </span>
  </div>
</div>
`;

function renderImage({ width, height, background, content, outputPath }) {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: ${background};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
</style>
</head>
<body>
  ${content}
</body>
</html>`;

  const tempHtml = path.resolve(`scripts/temp-render-${width}x${height}.html`);
  fs.writeFileSync(tempHtml, htmlContent, "utf-8");

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=${width},${height} --default-background-color=00000000 "file:///${tempHtml.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: "pipe" });

  fs.unlinkSync(tempHtml);
  const stat = fs.statSync(outputPath);
  console.log(`Rendered: ${outputPath} (${width}x${height}, ${stat.size} bytes)`);
}

console.log("=== RENDERIZANDO ASSETS OFICIAIS GRUPO J ===");

// 1. Ícone principal do aplicativo (iOS / Lojas): 1024x1024 sólido #00091D, badge ~620px
renderImage({
  width: 1024,
  height: 1024,
  background: "#00091D",
  content: SVG_SYMBOL(620),
  outputPath: path.resolve("apps/customer-mobile/assets/icon.png")
});

// 2. Ícone adaptativo Android (Foreground): 1024x1024 transparente, badge dentro da safe-zone circular (~460px)
renderImage({
  width: 1024,
  height: 1024,
  background: "transparent",
  content: SVG_SYMBOL(460),
  outputPath: path.resolve("apps/customer-mobile/assets/adaptive-icon.png")
});

// 3. Splash Screen oficial: 1284x2778 sólido #00091D com logo + lettering Grupo J
renderImage({
  width: 1284,
  height: 2778,
  background: "#00091D",
  content: SVG_SPLASH_CONTENT(200),
  outputPath: path.resolve("apps/customer-mobile/assets/splash.png")
});

// 4. Android Drawables: splashscreen_logo.png em todas as densidades
const drawableDensities = [
  { dir: "drawable-mdpi", size: 160, symbol: 120 },
  { dir: "drawable-hdpi", size: 240, symbol: 180 },
  { dir: "drawable-xhdpi", size: 320, symbol: 240 },
  { dir: "drawable-xxhdpi", size: 480, symbol: 360 },
  { dir: "drawable-xxxhdpi", size: 640, symbol: 480 }
];

for (const d of drawableDensities) {
  renderImage({
    width: d.size,
    height: d.size,
    background: "transparent",
    content: SVG_SYMBOL(d.symbol),
    outputPath: path.resolve(`apps/customer-mobile/android/app/src/main/res/${d.dir}/splashscreen_logo.png`)
  });
}

// 5. Android Mipmaps: ic_launcher, ic_launcher_round, ic_launcher_foreground
const mipmapDensities = [
  { dir: "mipmap-mdpi", iconSize: 48, symbolSize: 34, fgSize: 108, fgSymbol: 48 },
  { dir: "mipmap-hdpi", iconSize: 72, symbolSize: 52, fgSize: 162, fgSymbol: 72 },
  { dir: "mipmap-xhdpi", iconSize: 96, symbolSize: 70, fgSize: 216, fgSymbol: 96 },
  { dir: "mipmap-xxhdpi", iconSize: 144, symbolSize: 104, fgSize: 324, fgSymbol: 144 },
  { dir: "mipmap-xxxhdpi", iconSize: 192, symbolSize: 140, fgSize: 432, fgSymbol: 192 }
];

for (const m of mipmapDensities) {
  const baseDir = `apps/customer-mobile/android/app/src/main/res/${m.dir}`;

  // ic_launcher.png (ícone quadrado com fundo navy)
  renderImage({
    width: m.iconSize,
    height: m.iconSize,
    background: "#00091D",
    content: SVG_SYMBOL(m.symbolSize),
    outputPath: path.resolve(`${baseDir}/ic_launcher.png`)
  });

  // ic_launcher_round.png (ícone circular com fundo navy)
  const roundContent = `
    <div style="width: ${m.iconSize}px; height: ${m.iconSize}px; border-radius: 50%; background: #00091D; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      ${SVG_SYMBOL(m.symbolSize * 0.85)}
    </div>
  `;
  renderImage({
    width: m.iconSize,
    height: m.iconSize,
    background: "transparent",
    content: roundContent,
    outputPath: path.resolve(`${baseDir}/ic_launcher_round.png`)
  });

  // ic_launcher_foreground.png (foreground transparente para adaptive icon)
  renderImage({
    width: m.fgSize,
    height: m.fgSize,
    background: "transparent",
    content: SVG_SYMBOL(m.fgSymbol),
    outputPath: path.resolve(`${baseDir}/ic_launcher_foreground.png`)
  });
}

// 6. Atualizar também ícones web de admin e oficina para harmonia do ecossistema
const webTargets = [
  { dir: "apps/admin-web/public/icons", name: "icon-192.png", size: 192 },
  { dir: "apps/admin-web/public/icons", name: "icon-512.png", size: 512 },
  { dir: "apps/admin-web/public/icons", name: "icon-maskable.png", size: 512 },
  { dir: "apps/workshop-web/public/icons", name: "icon-192.png", size: 192 },
  { dir: "apps/workshop-web/public/icons", name: "icon-512.png", size: 512 },
  { dir: "apps/workshop-web/public/icons", name: "icon-maskable.png", size: 512 }
];

for (const w of webTargets) {
  renderImage({
    width: w.size,
    height: w.size,
    background: "#00091D",
    content: SVG_SYMBOL(Math.round(w.size * 0.65)),
    outputPath: path.resolve(`${w.dir}/${w.name}`)
  });
}

console.log("=== TODOS OS ASSETS OFICIAIS FORAM GERADOS COM SUCESSO! ===");
