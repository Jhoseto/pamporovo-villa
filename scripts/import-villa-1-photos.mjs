import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = "C:/Users/konst/.cursor/projects/h-Apps-PamporovoVilege-pamporovo-villa/assets";
const out = path.join(root, "client/public/photos/villa-1");
const tmp = path.join(root, "scripts/.tmp-villa-1");

const files = [
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-4d4e19acb85ddd07fe7ccda7270f64a5e841deb35f8984941f963571e87303d2_44cd819c710b76b6-ec1651f7-160f-4e89-af04-654192de823f.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-e231ca93639b10e82c1fb438c283646efbf7598c86da9a5252cb1d74558f5232_82e3d73b8603f392-31cfe7db-b5f5-46f3-80e7-03b12feb03bb.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0374-97ac4f2e-5d71-473f-85b3-875f3fc90f88.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0365-4a56238f-89b8-4f21-980e-9e236a10f5ff.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0368-179a71cb-e666-437b-9065-a0cf3aff0734.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0357_1-887e09a6-543d-458d-93be-48963023a1e0.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0358-cbd6a6b6-febb-4fbc-ab27-c1f765f982cd.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0359-87132585-05f9-40ca-a26c-c5024b66d0a7.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0369-32d0e758-f3a3-4d80-9730-578f12249ff5.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0363-15c1b2da-13de-4884-9c02-aa88869f9300.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0405-e3bd27b7-3526-4f36-92c0-1b00cf99396e.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0370-b4de2ba8-10c9-49d4-9cbb-59f8bb99bc74.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0376-2b24d08d-f00f-4a68-ad22-bf3cabde764e.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_IMG_0372-bad46264-7c46-4751-90c2-7f72603b56c6.png",
];

fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

for (let i = 0; i < files.length; i++) {
  const src = path.join(assets, files[i]);
  if (!fs.existsSync(src)) throw new Error(`Missing source: ${files[i]}`);
  const shortSrc = path.join(tmp, `${i + 1}.png`);
  fs.copyFileSync(src, shortSrc);
  const dest = path.join(out, `${String(i + 1).padStart(2, "0")}.jpg`);
  await sharp(shortSrc)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(dest);
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`${path.basename(dest)}  ${kb} KB`);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Done — ${files.length} photos in ${out}`);
