// Esperar a que la página esté completamente cargada
document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener referencias a los elementos del formulario
    const empleadoInput = document.getElementById('empleado');
    const horasInput = document.getElementById('horas');
    const horasExtrasInput = document.getElementById('horas-extras');
    const buqueInput = document.getElementById('buque');
    const trabajosInput = document.getElementById('trabajos');
    const fechaInput = document.getElementById('fecha');
    const observacionesInput = document.getElementById('observaciones');
    
    // Obtener referencias a los botones
    const generarBtn = document.getElementById('generar-btn');
    const imprimirBtn = document.getElementById('imprimir-btn');
    const limpiarBtn = document.getElementById('limpiar-btn');
    
    // Obtener referencia al área de vista previa
    const previewArea = document.getElementById('parte-preview');
    
    // Obtener referencia al historial
    const historialLista = document.getElementById('historial-lista');
    
    // Establecer la fecha actual por defecto
    const hoy = new Date();
    fechaInput.value = hoy.toISOString().split('T')[0];
    
    // Variable para almacenar los partes guardados
    let partesGuardados = JSON.parse(localStorage.getItem('partesServyman')) || [];
    
    // Mostrar el historial si hay partes guardados
    mostrarHistorial();
    
    // Función para generar el parte
    generarBtn.addEventListener('click', function() {
        generarParte();
    });
    
    // Función para imprimir
    imprimirBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Función para limpiar el formulario
    limpiarBtn.addEventListener('click', function() {
        limpiarFormulario();
    });
    
    // Función para generar el parte
    function generarParte() {
        // Obtener los valores del formulario
        const empleado = empleadoInput.value.trim();
        const horas = horasInput.value.trim();
        const horasExtras = horasExtrasInput.value.trim();
        const buque = buqueInput.value.trim();
        const trabajos = trabajosInput.value.trim();
        const fecha = fechaInput.value;
        const observaciones = observacionesInput.value.trim();
        
        // Verificar que los campos obligatorios estén llenos
        if (!empleado || !buque || !trabajos) {
            alert('Por favor, completa los campos obligatorios: Empleado, Buque y Trabajos Realizados');
            return;
        }
        
        // Formatear la fecha para mostrarla
        const fechaFormateada = formatearFecha(fecha);
        
        // Crear el HTML del parte
        const parteHTML = `
            <table class="parte-formato">
                <tr>
                    <td class="encabezado" colspan="2">SERVYMAN NAVAL SERVICES</td>
                    <td class="encabezado">EMPLEADO:</td>
                    <td class="encabezado" colspan="2">${empleado}</td>
                </tr>
                <tr>
                    <td class="encabezado">HRS.</td>
                    <td>${horas || '--'}</td>
                    <td class="encabezado" rowspan="2">TRABAJOS REALIZADOS</td>
                    <td colspan="2" rowspan="2">${trabajos.replace(/\n/g, '<br>')}</td>
                </tr>
                <tr>
                    <td class="encabezado">EXT.</td>
                    <td>${horasExtras || '--'}</td>
                </tr>
                <tr>
                    <td class="encabezado" colspan="3">NOMBRE DEL BUQUE</td>
                    <td colspan="2">${buque}</td>
                </tr>
                <tr>
                    <td class="encabezado" colspan="5">Fecha ${fechaFormateada}</td>
                </tr>
            </table>
            
            <div class="firma-area">
                <p><strong>Firma</strong></p>
                <p>_________________________________________</p>
            </div>
            
            <div class="observaciones">
                <p><strong>OBSERVACIONES:</strong></p>
                <p>${observaciones || 'No hay observaciones.'}</p>
            </div>
        `;
        
        // Mostrar el parte en la vista previa
        previewArea.innerHTML = parteHTML;
        
        // Guardar el parte en el historial
        guardarParte(empleado, buque, fechaFormateada, trabajos, horas, horasExtras);
    }
    
    // Función para formatear la fecha
    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    }
    
    // Función para guardar el parte
    function guardarParte(empleado, buque, fecha, trabajos, horas, horasExtras) {
        // Crear objeto del parte
        const nuevoParte = {
            id: Date.now(), // Usamos la marca de tiempo como ID único
            empleado: empleado,
            buque: buque,
            fecha: fecha,
            trabajos: trabajos,
            horas: horas || '0',
            horasExtras: horasExtras || '0',
            fechaGuardado: new Date().toLocaleString()
        };
        
        // Agregar al array de partes
        partesGuardados.unshift(nuevoParte); // Agregar al principio
        
        // Guardar en localStorage (base de datos del navegador)
        localStorage.setItem('partesServyman', JSON.stringify(partesGuardados));
        
        // Actualizar el historial
        mostrarHistorial();
        
        // Mostrar mensaje de éxito
        alert('Parte guardado correctamente en el historial');
    }
    
    // Función para mostrar el historial
    function mostrarHistorial() {
        if (partesGuardados.length === 0) {
            historialLista.innerHTML = '<p class="empty">No hay partes guardados todavía.</p>';
            return;
        }
        
        let historialHTML = '';
        
        partesGuardados.forEach(parte => {
            historialHTML += `
                <div class="parte-item">
                    <h4>${parte.buque} - ${parte.fecha}</h4>
                    <p><strong>Empleado:</strong> ${parte.empleado}</p>
                    <p><strong>Horas:</strong> ${parte.horas} | <strong>Extras:</strong> ${parte.horasExtras}</p>
                    <p><strong>Trabajos:</strong> ${parte.trabajos.substring(0, 50)}${parte.trabajos.length > 50 ? '...' : ''}</p>
                    <p><small>Guardado: ${parte.fechaGuardado}</small></p>
                    <button class="cargar-btn" data-id="${parte.id}">Cargar este parte</button>
                </div>
            `;
        });
        
        historialLista.innerHTML = historialHTML;
        
        // Agregar event listeners a los botones de cargar
        document.querySelectorAll('.cargar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                cargarParte(id);
            });
        });
    }
    
    // Función para cargar un parte del historial
    function cargarParte(id) {
        const parte = partesGuardados.find(p => p.id === id);
        
        if (!parte) {
            alert('No se encontró el parte solicitado');
            return;
        }
        
        // Cargar datos en el formulario
        empleadoInput.value = parte.empleado;
        horasInput.value = parte.horas;
        horasExtrasInput.value = parte.horasExtras;
        buqueInput.value = parte.buque;
        trabajosInput.value = parte.trabajos;
        
        // Convertir fecha de formato dd/mm/yyyy a yyyy-mm-dd
        const [dia, mes, año] = parte.fecha.split('/');
        fechaInput.value = `${año}-${mes}-${dia}`;
        
        // Generar automáticamente el parte
        generarParte();
        
        // Desplazarse al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Función para limpiar el formulario
    function limpiarFormulario() {
        empleadoInput.value = '';
        horasInput.value = '';
        horasExtrasInput.value = '';
        buqueInput.value = '';
        trabajosInput.value = '';
        fechaInput.value = hoy.toISOString().split('T')[0];
        observacionesInput.value = '';
        previewArea.innerHTML = '<p class="empty">Completa el formulario y haz clic en "Generar Parte" para ver la vista previa aquí.</p>';
    }
    
    // Generar un parte de ejemplo cuando se carga la página
    setTimeout(() => {
        empleadoInput.value = "Juan Pérez";
        horasInput.value = "8";
        horasExtrasInput.value = "2";
        buqueInput.value = "Ocean Explorer";
        trabajosInput.value = "Mantenimiento de motores principales\nRevisión del sistema de navegación\nCambio de filtros de aceite";
        observacionesInput.value = "El buque se encuentra en buen estado general. Se recomienda revisar el sistema eléctrico en la próxima visita.";
        generarParte();
    }, 500);
});