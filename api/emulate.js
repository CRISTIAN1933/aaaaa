export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Falta el parámetro 'url'" });
  }

  try {
    // Hacemos la petición a la URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      }
    });

    // Verificamos si la página respondió OK
    if (response.ok) {
      res.status(200).json({
        success: true,
        message: "La página fue emulada correctamente",
        status: response.status
      });
    } else {
      res.status(200).json({
        success: false,
        message: "La página respondió con error",
        status: response.status
      });
    }
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Error al intentar emular la página",
      error: err.message
    });
  }
}
