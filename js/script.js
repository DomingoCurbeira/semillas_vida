let allSeeds = [];
let currentIndex = 0;

// Formateador de fecha en español
const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });

function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return ((day - 1) % 180) + 1;
}

async function init() {
    try {
        const response = await fetch('data/semillas.json');
        allSeeds = await response.json();
        
        // REGLA DE RUTA: ¿Viene un ID en la URL?
        const params = new URLSearchParams(window.location.search);
        const sharedId = params.get('id');

        if (sharedId && allSeeds[sharedId - 1]) {
            currentIndex = parseInt(sharedId) - 1;
        } else {
            currentIndex = getDayOfYear() - 1;
        }
        
        renderSeed(currentIndex);
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Calcula la fecha correspondiente a una semilla basada en la fecha actual
 * @param {number} index - El índice de la semilla que estamos viendo
 */
function getFormattedDate(index) {
    const todayIndex = getDayOfYear() - 1;
    const diff = index - todayIndex; // Diferencia de días respecto a hoy
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + diff); // Sumamos o restamos la diferencia
    
    // Retornamos la fecha formateada (ej: 2 de mayo)
    return dateFormatter.format(targetDate);
}

function renderSeed(index) {
    const seed = allSeeds[index];
    const todayIndex = getDayOfYear() - 1;

    // Fecha: Si es el día de hoy, ponemos la fecha real. Si es navegación, indicamos el día.
    document.getElementById('seed-date').innerText = getFormattedDate(index);

    document.getElementById('seed-title').innerText = seed.titulo;
    document.getElementById('seed-verse').innerText = `"${seed.versiculo}"`;
    document.getElementById('seed-reference').innerText = seed.cita;
    document.getElementById('seed-reflection').innerText = seed.reflexion;
    document.getElementById('card-bg').style.backgroundImage = `url('${seed.imagen}')`;

    // Actualizar botones navegación
    document.getElementById('prev-btn').disabled = index <= 0;
    document.getElementById('next-btn').disabled = index >= todayIndex;

    // Actualizar la URL sin recargar la página para que se pueda copiar
    const newUrl = `${window.location.origin}${window.location.pathname}?id=${seed.id}`;
    window.history.replaceState({path: newUrl}, '', newUrl);
}

// --- FUNCIONES GLOBALES DE COMPARTIR ---

function shareWhatsApp() {
    // Obtenemos los datos de la semilla que se está viendo actualmente
    const seed = allSeeds[currentIndex];
    
    // Formateamos el mensaje con negritas para WhatsApp
    const text = `🌱 *Semilla de Vida: ${seed.titulo}*\n\n` +
                 `"${seed.versiculo}"\n` +
                 `_(${seed.cita})_\n\n` +
                 `Léela completa aquí: ${window.location.href}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareFacebook() {
    // Facebook solo necesita la URL, el título lo lee de la página
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function copyLink() {
    const icon = document.getElementById('copy-icon');
    const parentBtn = icon.closest('.share-btn'); // Buscamos el botón padre para el color
    
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            // Guardamos todo el código del SVG
            const originalSvg = icon.innerHTML;
            
            // Feedback visual
            icon.innerHTML = "✅"; 
            parentBtn.style.borderColor = "#22c55e";
            parentBtn.style.backgroundColor = "#f0fdf4"; // Un toque verde suave de fondo
            
            setTimeout(() => {
                // Restauramos el código del SVG original
                icon.innerHTML = originalSvg;
                parentBtn.style.borderColor = "#e7e5e4";
                parentBtn.style.backgroundColor = "white";
            }, 2000);
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            // Fallback por si el navegador bloquea el portapapeles
            const input = document.createElement('input');
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert("Enlace copiado al portapapeles");
        });
}

// Botones de navegación (como antes)
document.getElementById('prev-btn').addEventListener('click', () => { if(currentIndex > 0) renderSeed(--currentIndex); });
document.getElementById('next-btn').addEventListener('click', () => { if(currentIndex < getDayOfYear()-1) renderSeed(++currentIndex); });
document.getElementById('today-btn').addEventListener('click', () => { currentIndex = getDayOfYear()-1; renderSeed(currentIndex); });

init();