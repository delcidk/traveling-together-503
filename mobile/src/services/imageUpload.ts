export async function uploadImageToImgBB(base64Image: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la llave EXPO_PUBLIC_IMGBB_API_KEY en el archivo .env");
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const formData = new FormData();
  formData.append("image", cleanBase64);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.success && data.data?.url) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || "Error al subir la imagen a ImgBB");
  }
}
