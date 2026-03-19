import { writeFile } from "fs/promises";
import path from "path";

export const uploadFile = async (file, folder) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(
    process.cwd(),
    "public",
    "uploads",
    folder,
    filename,
  );

  await writeFile(filepath, buffer);
  return `/uploads/${folder}/${filename}`;
};
