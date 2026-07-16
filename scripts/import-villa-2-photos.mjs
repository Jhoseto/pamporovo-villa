import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = "C:/Users/konst/.cursor/projects/h-Apps-PamporovoVilege-pamporovo-villa/assets";
const out = path.join(root, "client/public/photos/villa-2");
const tmp = path.join(root, "scripts/.tmp-villa-2");

const files = [
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-010a0d05ad9f3b83fe4759d18b943ce8a2973daf764aa193ac2fbc077e80cc9b_3f07e450f0c133a7-7e1dbf3a-5771-4356-a43e-803950ab61e0.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-cf827579f0f609a01c2989cef5bb48c7f2d7ec7e22f21821814b8c9624c3861a_359bafc88ad62b6-ba0b397c-60f6-4ccd-83e8-cc3bb550e713.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-8768817527298a34891f7e328f8535563ddd4692cf6542a4df983966702bdffa_d3775ad90ebefbf4-fd1c2b43-b704-4143-ab3b-1a0b92f45f9d.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-a0d7bd0b7dc25d6b8cc02e5ac7b3f00567134e60f33a2eeb072e30c35e1b4d91_4cc92e657849e033-0703a160-6b6b-4f09-8be2-e27cacd08bf3.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-99eda99f663c1936b04cce466cd1a865948267472b2b06a1026212b18112f109_e908a2ec114b5988-9b1163ae-cc6c-467d-8aff-e1c8d8ffc815.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-672f8799d69c69654e33780e054bc68c7620c274d72d87508bb232cbfb2a2b9d_6eb94afb298b66e0-2718cb69-f6a0-4082-8b7b-2ff5da9c6424.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-97507404a13320deb01786d56930f73bd03c19f00bd637222b09050346e2f1cc_b1a75c5f36a1bde1-6932d486-2e42-49b4-ad78-353b8eb697c9.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-f39516e2b0a3e6372f4b486dca3a433edb07f33d7ee410002312c0206a17401e_c6a6410ce1cc352c-e5ce9e4f-4245-4c23-855f-7fe4b21ec282.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-1bd3374a4bb8577c3a187f42c3b8df34c246d6c02c663e04efd0ec4742f70802_18fce0821cd293db-34710e39-b16a-40e3-bf01-28e9a6b27196.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-ab27e9c08a9f04d8878aa1adfeb3d8c5d1a73be598f822d5f582558a1d20fbc3_e9fedecd0550a8ca-97dc6c60-c5a7-4e76-be30-b91d5a29b734.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-f561bcec09a0950c09ee2d7162ce96ee446a1320c3eae85e9f7158f4c9bff4cf_a38e5dfb8acb3479-40866a6f-87f7-46d2-ab91-80b4f063e0b3.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-b1a673ae1d940963f79061b2ae924dd9d2f7e8011e5401a5995fdded479706e7_eaa4defaf1e756b4-775ee680-777a-4b99-abc5-c5e20845cd68.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-e250140f3139d10ba7984112cb810ea031c3dd2f008ca2955bb9a7d93870e4e8_d8fa2be9736841a0-7e45838d-453f-4908-8da2-82d11e079456.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-1f28849da5505d2a02323031990cab7f740fb4dd13661999a89645a3840fd559_abff90675c1d4aa8-aa5b038a-eea3-4df3-8047-a8a5ff3ec62b.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-bf7d7210809b77adf598b16dcbc2e3a31104c1dbb2d12f187aceeddcfc6237ca_e9b85e795521e4ab-be8b762f-4b53-4f31-a3ac-e0a4c55ce3d6.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-f87c433da6101f114739e3b26e2df1212affc81081a9491863e572a74425a50d_979101b633809d39-f50040f8-d7a1-49de-9706-5d400ff3c984.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-b96e29180d4648cc2af6b82ff7fa037188f5d56e7619d39d3c2b20839f7bbed1_dceea52e7912ad7a-7d465585-736d-4a6d-aaf0-153ebaed4641.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-55491520a68835f652d32cd044198d4d08a765021ca9cdeaf0c84a2f49fdc4ab_bf87a8761220b4e9-acc41ece-5801-4006-87c8-9ef29b2664d8.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-a8ee4a11772ee56fa94e6074e9e4aa4b8a84030649b8acd01d72863d4801f991_96faf385cff356e1-16294280-b482-4d9a-a74a-5e0ac60cd4ae.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-90128d3e5a3894ff45f2a349d914b4821755529713f60a198f4b51dec141d8b8_5f257c9829c1a31a-c7e6e4b5-f9c3-4c59-9a0e-34c3c1d35262.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-bc13f072ed15719a69caf4fc98a7f7db5b3042620ff8b27a0a93781d74fb40b0_87a78e8f88fc1fa7-34a55660-74cc-4e1a-b7ca-89fdf7708d26.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-ba73bdf22c050e7e1c1735e2863c4c7b2d32c6bcb09b16fdebf560158c0acc41_18aa129b1c301d9e-f439d30f-8e77-4cf0-9f0f-23f54b4d887e.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-369964e1560571221acf3a4e7517f1ac65e462f1ae57b12bcaef1e6e6addcca6_a9e5c6d58c8601b5-b83f696d-2138-4f07-8271-7aacd43c6977.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-1418985c7360dfc1654964348bb33e5332297dc4292ff8e41fac164994ab61f5_b6d13f2cfbe279e7-225f8b7b-ac15-4820-a43d-2ff45fd977a1.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-c4cf0b761c0a7c6ae6d09efdc6531e5057012792e1500901f871d72d8c3cbd4e_8f2c22a378e1d054-9262437b-741b-408d-8421-c3907f859109.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-67c6462c7528b0675a9b4423bfec3541e790691654035f901567df6bbc02f11d_4544dbe207cf818e-341ba697-5132-428c-b9f0-67471f486833.png",
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
  console.log(`${path.basename(dest)}  ${Math.round(fs.statSync(dest).size / 1024)} KB`);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Done — ${files.length} photos in ${out}`);
