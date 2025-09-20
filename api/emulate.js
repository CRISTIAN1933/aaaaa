export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Falta el parámetro 'url'" });
  }

  try {
    // 1️⃣ Obtener HTML de la página
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return res.status(200).json({
        success: false,
        message: "La página respondió con error",
        status: response.status
      });
    }

    let html = await response.text();

    // 2️⃣ Buscar el botón en el HTML
    const botonExiste = html.includes('class="button-activar"') && html.includes('type="submit"');

    let botonPresionado = false;

    // 3️⃣ Simular "press" si el botón existe
    if (botonExiste) {
      // Intentamos enviar un POST al mismo endpoint del form (si tiene action)
      const actionMatch = html.match(/<form[^>]*id=["']activar-form["'][^>]*action=["']([^"']+)["']/i);
      let actionUrl = url; // Por defecto el mismo URL
      if (actionMatch && actionMatch[1]) {
        actionUrl = actionMatch[1].startsWith("http") ? actionMatch[1] : new URL(actionMatch[1], url).href;
      }

      // Simulamos el submit del form
      try {
        const submitResponse = await fetch(actionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
          },
          body: "activar=Activar"
        });
        botonPresionado = submitResponse.ok;
      } catch (err) {
        botonPresionado = false;
      }
    }

    res.status(200).json({
      success: true,
      botonExiste,
      botonPresionado
    });

  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Error al intentar emular la página",
      error: err.message
    });
  }
}
