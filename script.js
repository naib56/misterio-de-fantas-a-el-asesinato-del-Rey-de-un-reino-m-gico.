const btnGenerar = document.getElementById('btn-generar-caso');
const inputApiKey = document.getElementById('api-key');
const textoHistoria = document.getElementById('historia-texto');
const zonaJuego = document.getElementById('zona-juego');
const listaAcertijos = document.getElementById('lista-acertijos');
const contenedorCuadricula = document.getElementById('cuadricula');
const botonResolver = document.getElementById('btn-resolver');
const textoMensajeFinal = document.getElementById('mensaje-final');

let solucionActual = "";

// El "Prompt del Sistema" que le dice a Gemini cómo debe comportarse
const promptExperto = `
Eres un escritor experto en novelas de misterio, fantasía y dramas románticos. 
Tu tarea es generar un mini-juego de escape room estructurado estrictamente en formato JSON.
No escribas nada más, solo el objeto JSON válido.

Estructura requerida:
{
  "historia": "Escribe un prólogo de 3 líneas sobre un crimen intrigante en un reino de fantasía o un entorno histórico dramático.",
  "acertijos": [
    "Acertijo poético 1 (cuya respuesta es una sola palabra)",
    "Acertijo poético 2 (cuya respuesta es una sola palabra)",
    "Acertijo poético 3 (cuya respuesta es una sola palabra)"
  ],
  "mapaLetras": ["A","B","C"...], // DEBE ser un array de EXACTAMENTE 36 letras mayúsculas. Mezcla aquí las respuestas de los acertijos y las letras del mensaje oculto.
  "solucionSecreta": "FRASEFINAL" // Las letras sobrantes que revelan al culpable (sin espacios).
}
`;

btnGenerar.addEventListener('click', async () => {
    const apiKey = inputApiKey.value.trim();
    if (!apiKey) {
        alert("Por favor, ingresa tu API Key de Gemini.");
        return;
    }

    textoHistoria.innerText = "Los engranajes del destino están girando. Gemini está escribiendo el caso...";
    zonaJuego.style.display = 'none';

    try {
        // Llamada a la API de Google Gemini (modelo Flash, ideal para respuestas rápidas)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptExperto }] }]
            })
        });

        const data = await response.json();
        
        // Limpiamos el formato markdown que a veces incluye la IA (```json ... ```)
        let textoCrudo = data.candidates[0].content.parts[0].text;
        textoCrudo = textoCrudo.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const casoGenerado = JSON.parse(textoCrudo);

        construirNivel(casoGenerado);

    } catch (error) {
        console.error(error);
        textoHistoria.innerText = "Hubo un error en la magia. Verifica tu conexión o tu API Key.";
    }
});

function construirNivel(datos) {
    // 1. Cargar la narrativa y mostrar el juego
    textoHistoria.innerText = datos.historia;
    solucionActual = datos.solucionSecreta;
    zonaJuego.style.display = 'flex';
    textoMensajeFinal.innerText = "";

    // 2. Cargar Acertijos
    listaAcertijos.innerHTML = "";
    datos.acertijos.forEach(acertijo => {
        const li = document.createElement('li');
        li.innerText = acertijo;
        listaAcertijos.appendChild(li);
    });

    // 3. Cargar la Sopa de Letras (Validando que sean 36)
    contenedorCuadricula.innerHTML = "";
    const letras = datos.mapaLetras.slice(0, 36); // Aseguramos 36 celdas
    
    letras.forEach((letra) => {
        const divLetra = document.createElement('div');
        divLetra.classList.add('letra');
        divLetra.innerText = letra;
        
        divLetra.addEventListener('click', () => {
            divLetra.classList.toggle('marcada');
        });

        contenedorCuadricula.appendChild(divLetra);
    });
}

// 4. Lógica de Resolución
botonResolver.addEventListener('click', () => {
    const todasLasLetras = document.querySelectorAll('.letra');
    let letrasSobrantes = "";

    todasLasLetras.forEach(div => {
        if (!div.classList.contains('marcada')) {
            letrasSobrantes += div.innerText;
        }
    });

    if (letrasSobrantes === solucionActual) {
        textoMensajeFinal.innerText = `¡CASO RESUELTO!\n${solucionActual}`;
        textoMensajeFinal.style.color = "#27ae60"; 
    } else {
        textoMensajeFinal.innerText = "Las pistas no encajan... Revisa tus selecciones.";
        textoMensajeFinal.style.color = "#8b0000"; 
    }
});
