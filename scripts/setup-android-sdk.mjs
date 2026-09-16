import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const sdkRoot = "C:\\Users\\knzao\\Android\\sdk";
const licensesDir = path.join(sdkRoot, "licenses");

if (!fs.existsSync(licensesDir)) {
  fs.mkdirSync(licensesDir, { recursive: true });
}

// Write standard accepted license hashes
fs.writeFileSync(
  path.join(licensesDir, "android-sdk-license"),
  "24333f8a63b6825ea9c5514f83c2829b004d1fee\n8933bad161af4178b1185d1a37fbf41ea5269c55\nd56f5187479451eabf01fb78af6dfcb131a6481e\n"
);
fs.writeFileSync(
  path.join(licensesDir, "android-sdk-preview-license"),
  "84831b9409646a53fe443e8ea8c8086100345751\n"
);
fs.writeFileSync(
  path.join(licensesDir, "android-googletv-license"),
  "601085b94cd77f0b54ff864063f457bd80466804\n"
);

console.log("Android licenses written successfully to", licensesDir);

const packagesToInstall = [
  "platform-tools",
  "platforms;android-34",
  "build-tools;34.0.0"
];

const sdkManagerCmd = path.join(sdkRoot, "cmdline-tools", "12.0", "bin", "sdkmanager.bat");
const env = {
  ...process.env,
  JAVA_HOME: "C:\\Users\\knzao\\.jdk17",
  PATH: `C:\\Users\\knzao\\.jdk17\\bin;${process.env.PATH}`,
  ANDROID_HOME: sdkRoot,
  ANDROID_SDK_ROOT: sdkRoot
};

console.log("Installing SDK packages:", packagesToInstall.join(", "));
const proc = spawn(sdkManagerCmd, [`--sdk_root=${sdkRoot}`, ...packagesToInstall], {
  env,
  shell: true,
  stdio: ["pipe", "inherit", "inherit"]
});

proc.stdin.write("y\ny\ny\ny\ny\ny\ny\n");
proc.stdin.end();

proc.on("exit", (code) => {
  console.log(`sdkmanager process finished with code ${code}`);
  process.exit(code || 0);
});
