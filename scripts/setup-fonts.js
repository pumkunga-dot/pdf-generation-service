const fs = require("fs");
const path = require("path");
const https = require("https");

const fontsDir = path.join(__dirname, "..", "assets", "fonts");
const regularFont = path.join(fontsDir, "NotoSansThai-Regular.ttf");
const boldFont = path.join(fontsDir, "NotoSansThai-Bold.ttf");
const zipPath = path.join(fontsDir, "NotoSansThai.zip");
const zipUrl =
  "https://github.com/notofonts/thai/releases/download/NotoSansThai-v2.002/NotoSansThai-v2.002.zip";

function isValidFont(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 10000;
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          download(response.headers.location, destination).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download fonts: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

async function extractWithPowerShell(zipFile, destination) {
  const { execFileSync } = require("child_process");
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -Path '${zipFile.replace(/'/g, "''")}' -DestinationPath '${destination.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" }
  );
}

function findFontFile(rootDir, fileName) {
  for (const entry of fs.readdirSync(rootDir)) {
    const entryPath = path.join(rootDir, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory()) {
      const found = findFontFile(entryPath, fileName);
      if (found) return found;
      continue;
    }
    if (entry === fileName && stat.size > 10000) {
      return entryPath;
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(fontsDir, { recursive: true });

  if (isValidFont(regularFont) && isValidFont(boldFont)) {
    console.log("Thai fonts already installed.");
    return;
  }

  console.log("Downloading Noto Sans Thai fonts...");
  await download(zipUrl, zipPath);

  const extractDir = path.join(fontsDir, "NotoSansThai-extracted");
  fs.mkdirSync(extractDir, { recursive: true });
  await extractWithPowerShell(zipPath, extractDir);

  const sourceRegular = findFontFile(extractDir, "NotoSansThai-Regular.ttf");
  const sourceBold = findFontFile(extractDir, "NotoSansThai-Bold.ttf");

  if (!sourceRegular || !sourceBold) {
    throw new Error("Could not find Noto Sans Thai font files in downloaded archive");
  }

  fs.copyFileSync(sourceRegular, regularFont);
  fs.copyFileSync(sourceBold, boldFont);
  console.log("Installed:", regularFont);
  console.log("Installed:", boldFont);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
