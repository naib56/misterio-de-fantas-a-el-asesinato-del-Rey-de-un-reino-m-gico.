const btnGenerar = document.getElementById('btn-generar-caso');
const inputApiKey = document.getElementById('api-key');
const textoHistoria = document.getElementById('historia-texto');
const zonaJuego = document.getElementById('zona-juego');
const listaAcertijos = document.getElementById('lista-acertijos');
const contenedorCuadricula = document.getElementById('cuadricula');
const botonResolver = document.getElementById('btn-resolver');
const textoMensajeFinal = document.getElementById('mensaje-final');

let solucionActual = "";

const promptExperto = `
Eres un escritor experto en novelas de misterio y fantasía. 
Genera un mini-juego de misterio estructurado EXACTAMENTE en formato JSON, sin texto adicional fuera del objeto.

Estructura requerida:
{
  "historia": "Un prólogo de 3 líneas sobre un crimen en un reino de fantasía.",
  "acertijos": [
    "Acertijo poético 1 (respuesta de una palabra)",
    "Acertijo poético 2 (respuesta de una palabra)",
    "Acertijo poético 3 (respuesta de una palabra)"
  ],
  "mapaLetras": ["A","B","C",...],
  "solucionSecreta": "FRASEFINAL"
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptExperto }] }]
            })
        });

        const data = await response.json();
        
        let textoCrudo = data.candidates[0].content.parts[0].text;
        
        // Extracción limpia y robusta de JSON (ignora cualquier texto extra de la IA)
        const inicioJson = textoCrudo.indexOf('{');
        const finJson = textoCrudo.lastIndexOf('}');
        if (inicioJson !== -1 && finJson !== -1) {
            textoCrudo = textoCrudo.substring(inicioJson, finJson + 1);
        }
        
        const casoGenerado = JSON.parse(textoCrudo);
        construirNivel(casoGenerado);

    } catch (error) {
        console.error(error);
        textoHistoria.innerText = "Hubo un error en la magia. Verifica tu conexión o tu API Key.";
    }
});

function construirNivel(datos) {
    textoHistoria.innerText = datos.historia;
    solucionActual = datos.solucionSecreta;
    zonaJuego.style.display = 'flex';
    textoMensajeFinal.innerText = "";

    listaAcertijos.innerHTML = "";
    datos.acertijos.forEach(acertijo => {
        const li = document.createElement('li');
        li.innerText = acertijo;
        listaAcertijos.appendChild(li);
    });

    contenedorCuadricula.innerHTML = "";
    const letras = datos.mapaLetras.slice(0, 36);
    
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
  
