import env from "@/env";
import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey : env.imagekit.publicKey,
  privateKey :  env.imagekit.privateKey,
  urlEndpoint :  env.imagekit.urlEndpoint
});
