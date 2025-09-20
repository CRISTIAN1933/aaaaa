export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Falta el parámetro 'url'" });
  }

  try {
    // 1️⃣ Obtener HTML inicial de la página
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

    // 2️⃣ Verificar si existe el botón "Activar"
    const botonExiste = html.includes('class="button-activar"') && html.includes('type="submit"');
    let botonPresionado = false;
    let enlaceBoxVisible = false; // Solo se puede detectar después de presionar el botón

    if (botonExiste) {
      // Intentamos enviar un POST al action del form (simulación del click)
      const actionMatch = html.match(/<form[^>]*id=["']activar-form["'][^>]*action=["']([^"']+)["']/i);
      let actionUrl = url; // por defecto, el mismo URL
      if (actionMatch && actionMatch[1]) {
        actionUrl = actionMatch[1].startsWith("http") ? actionMatch[1] : new URL(actionMatch[1], url).href;
      }

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

        // 3️⃣ Después del submit, intentar detectar el div "enlace-box"
        if (botonPresionado) {
          const postHtml = await submitResponse.text?.(); // Si la respuesta tiene HTML
          if (postHtml && postHtml.includes('class="enlace-box"')) {
            enlaceBoxVisible = true;
          }
        }
      } catch (err) {
        botonPresionado = false;
        enlaceBoxVisible = false;
      }
    }

    // 4️⃣ Devolver JSON final
    res.status(200).json({
      success: true,
      botonExiste,
      botonPresionado,
      enlaceBoxVisible
    });

  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Error al intentar emular la página",
      error: err.message
    });
  }
}
