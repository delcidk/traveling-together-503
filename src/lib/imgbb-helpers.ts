export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la llave de API de ImgBB en .env.local");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || "Error al subir la imagen a ImgBB");
  }
}
