import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const jdkDir = path.join(process.env.USERPROFILE || "C:\\Users\\knzao", ".jdk17");
const javaExe = path.join(jdkDir, "bin", "java.exe");

if (fs.existsSync(javaExe)) {
  console.log(`JDK 17 already installed at: ${jdkDir}`);
  process.exit(0);
}

console.log("Downloading OpenJDK 17 portable zip...");
const zipUrl = "https://aka.ms/download-jdk/microsoft-jdk-17.0.12-windows-x64.zip";
const zipPath = path.join(process.env.TEMP || "C:\\Temp", "jdk17.zip");

async function main() {
  const res = await fetch(zipUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch JDK: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(zipPath, buffer);
  console.log(`Downloaded ${buffer.length} bytes. Extracting...`);

  const tempExtract = path.join(process.env.TEMP || "C:\\Temp", "jdk17_extracted");
  if (fs.existsSync(tempExtract)) {
    fs.rmSync(tempExtract, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtract, { recursive: true });

  execSync(`tar -xf "${zipPath}" -C "${tempExtract}"`);

  // Locate the inner folder containing bin/java.exe
  const files = fs.readdirSync(tempExtract);
  let innerDir = tempExtract;
  for (const f of files) {
    const candidate = path.join(tempExtract, f);
    if (fs.existsSync(path.join(candidate, "bin", "java.exe"))) {
      innerDir = candidate;
      break;
    }
  }

  if (!fs.existsSync(jdkDir)) {
    fs.mkdirSync(jdkDir, { recursive: true });
  }

  // Move files to jdkDir
  const innerItems = fs.readdirSync(innerDir);
  for (const item of innerItems) {
    fs.renameSync(path.join(innerDir, item), path.join(jdkDir, item));
  }

  console.log(`JDK 17 successfully installed to ${jdkDir}`);
  // Cleanup
  try {
    fs.unlinkSync(zipPath);
    fs.rmSync(tempExtract, { recursive: true, force: true });
  } catch {}
}

main().catch(err => {
  console.error("Error setting up JDK 17:", err);
  process.exit(1);
});
