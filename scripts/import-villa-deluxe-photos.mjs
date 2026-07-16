import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = "C:/Users/konst/.cursor/projects/h-Apps-PamporovoVilege-pamporovo-villa/assets";
const out = path.join(root, "client/public/photos/villa-deluxe");
const tmp = path.join(root, "scripts/.tmp-villa-deluxe");

const files = [
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-894c1187d072949a06ddf19be8cfa4a65f0b059e47ff4fcda111be5f4b114726_fe486653648650ec-0e17b729-b62b-4aeb-9c54-ba978b5e37b3.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-44db30ee0118fcd2fae42abfc7455984e69c09da9aee5b8600cc8f7cd1010160_280f3fc5d9fc0c96-5370b7a6-5d13-40ff-b815-d52f790ed088.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-747a0210382791dc7624724f89c31ae71c15c06c66c36eb98af336998e62c48c_f4ef598c163301fb-5404344a-c1ed-4766-855f-519f56765048.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-62dbd87199faa7b2ffb21014e3e5cd71aed9da0a688741ff51417f4f723febf1_1b5318d21ad52cfb-95f36c59-5e34-41dc-b1b8-0e61c71aaeb0.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-a943f5391f799fc7f5ceaac94aea225ffb938ef82b20386d5024cafa03e83b78_a3bb80492fab367a-88a38182-b9a2-4f70-a7bf-76a6a8e80c21.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-c66f9bf8281245adf98f44ab60d07c0158a519ac0669e115c292309f3796773b_4a4aeb1c40f58773-1ffbb26b-38e9-412a-b74b-b07f2fea28aa.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-6042fd2804a4b8f8ce3649d14894d21ac5e44558c3309a6191637c34d63d2b9e_f955c80e16e4efe3-b7cd1dfc-000e-4987-9e2e-106eda0244de.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-2cd740218dcaedbc98ef9a1f6aca13968065d5da3f308711dd1ea50fb12c39a5_1aaac62ab55eef4d-b78cf19d-4e43-47d4-b1db-6fbcbd6fc954.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-49d9b4a5375840969663f80804ec01d5191960d44e79f9064bb1af015310e2d1_6d20e50a482ced04-48db0c9d-267d-4557-bf5e-930413215301.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-42c8cd4bc4852c6247f071c68ba26e3bc27419999bd27c12636d4c53030f0116_29506f1535ab2312-16f287e6-6d5e-4d63-a016-cf1530bd056f.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-5c095f6bb6e36bb619ee90e60dae55ac45b186396dd6484315502fc25f8de8ea_6663970b060c5a19-1485eeaf-12d0-4987-920f-b3fcff84801d.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-6296b368ed07458946bf0a65d9ff441875e1222a14d4e10a671fa5971dff7ec5_b20bcbf1184832a1-d09f4a63-48f0-4420-9ff6-82e850295a99.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-cb47a701b060e2f7b4bcdc0a8ecf1ff4df1993af6eac487fddf8cc6fc9868f09_a4e216a00a7a5c6d-be44ca47-e37d-46d9-b571-c22291ef75b6.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-d2bc6ff8252a418954c086bb065a25ac7ca48dbd59299ccfaf16d4ee70065a08_ce29ad64f2bd51b9-46d53a25-d38b-434a-ab31-65cf4fca5577.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-8bd818c61372a71fe4ebb4a86934274acc366d1dad271ce24db6fb17d9a8802a_b48776439287a570-aae790ba-8b7a-4749-a83a-17726fc45acd.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-f08f504a2cf402a1a69633d1aeef8cc55af744161e893d692018eb9c13474482_80247d31bf99174f-8791f666-454e-47cf-b924-076240260cdc.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-1eda0194f2232c92b877ea7a0669d108d19e0162e2ce3718980fd164e475e650_d66fef9ab8e13b68-27a416c6-c494-484a-ab21-0a5439bfbf21.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-d2befe56510abaade1daf475bccd49fc5605b87e3f765fac2f4cb8f6d2dcbb80_83ee95f683140798-ea22af80-8e44-434c-a74a-8006f9de5871.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-0e9221d4495f595cb79cf631b1f13b88d264f784879b8f6822f1729c51c126a9_a858062076b03db0-dc93be46-ecf6-4d47-80eb-8a8f7b37de0f.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-2ac5ffbef70f31484c66d6e92e2dd8dd6a006ff326911b616fda5d0bfa766b59_848d6d4e67ade024-e2a2409e-123f-4eb1-8829-53fffcdaea5d.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-33f60e8b9ef81380d3f464d24ad99f0071e4c12875324da3bc5d4f772ae6cf48_c01745d961957322-5d0294cd-b359-4859-86f0-55fe235e11ac.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-cce57b4838e7a03102558d736558cc41aa88a146bbec208a612c2f1409d3628e_f49a0bb110f8c315-e68f5609-6fc8-4203-9fe7-1688272a7561.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-f4002c3015a045ba25c2e1f8bfe40a9176a0f74a41e7d4048f18248080aa50da_7d12d062716d832e-547028e4-a53b-4165-a872-356e923679ab.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-cf0dee04d0174b502541fdf983bb13839d3e90df44584c626e70edcce0a5c4f6_82ae3c681471a2c5-e098e673-6711-465f-a02b-419678bcf774.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-adbd35550976c834a83e6d663f9d254f4f158681d6d28fcea497074e4c448a0b_3b307d35d2f247b0-2aefae60-c2db-4fb5-bfd3-464cf590cda9.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-909f17d60a4ffce9a979c6049e7bbba6e8f7039d5d0aceca79a881dba535e7e0_aab6615120ea014c-fb19968c-3cb6-4e7e-b0a6-dbe786144f6c.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-44e7183c5fc16b9c12e3dc74c1aadcd1a95664c94ae6a34f2cd1331919e40c4f_5a47231ecf7b3b16-f1df139b-2e41-4d6e-9f56-49032641e20f.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-a772da17bb8bd953ce398ca1b0016efa8cc25a847d625a031924be57bd3603a4_417d279ee8ee460d-f4db87ee-49fc-4657-83db-5cc876b14f26.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-b7b72118a02ea9037a9ee963db8cf9733a351cb0ee89bd3eaed553362beed700_e6e4c958c152dc67-60e53958-8e12-4fb0-9db2-26acd7d4e614.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-614a6213f0c353380103e0911a7dbc0de718df92a7a69914b44cd6b8431661ad_2bdbe1de0677d9b6-1dcff579-a595-481d-aed2-926f2dee91e4.png",
  "c__Users_konst_AppData_Roaming_Cursor_User_workspaceStorage_17b9c59dd4861ea55c26cdcfab9c40f0_images_0-02-05-985da699d954931ae4f5a8779b45588ee8a8e8daff06cad54c30347c1099ad9e_9d86d367d22e9c5f-416fbda6-4bee-4efb-88cf-94b2439e65cb.png",
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
