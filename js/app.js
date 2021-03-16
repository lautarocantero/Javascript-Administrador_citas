let DB;


const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

// Contenedor para las citas
const contenedorCitas = document.querySelector('#citas');

// Formulario nuevas citas
const formulario = document.querySelector('#nueva-cita')
formulario.addEventListener('submit', nuevaCita);

let editando = false;


//otra forma de llamarlo cuando se carge la pagina

window.onload = () =>{
    eventListeners();
    crearDB();
}



// Eventos

function eventListeners() {
    mascotaInput.addEventListener('change', datosCita);
    propietarioInput.addEventListener('change', datosCita);
    telefonoInput.addEventListener('change', datosCita);
    fechaInput.addEventListener('change', datosCita);
    horaInput.addEventListener('change', datosCita);
    sintomasInput.addEventListener('change', datosCita);
}

const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora:'',
    sintomas: ''
}


function datosCita(e) {
    //  console.log(e.target.name) // Obtener el Input
     citaObj[e.target.name] = e.target.value;
}

// CLasses
class Citas {
    constructor() {
        this.citas = []
    }
    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }
    editarCita(citaActualizada) {
        this.citas = this.citas.map( cita => cita.id === citaActualizada.id ? citaActualizada : cita)
    }

    eliminarCita(id) {
        this.citas = this.citas.filter( cita => cita.id !== id);
    }
}

class UI {
    imprimirAlerta(mensaje, tipo) {
        // Crea el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');
        
        // Si es de tipo error agrega una clase
        if(tipo === 'error') {
             divMensaje.classList.add('alert-danger');
        } else {
             divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        document.querySelector('#contenido').insertBefore( divMensaje , document.querySelector('.agregar-cita'));

        // Quitar el alert despues de 3 segundos
        setTimeout( () => {
            divMensaje.remove();
        }, 3000);
   }

   imprimirCitas() { // Se puede aplicar destructuring desde la función...
       
        this.limpiarHTML();

        //leer el contenido de la base de datos
        const objectStore = DB.transaction('citas').objectStore('citas');

        //no necesito un for each, cursor recorre todo por mi
        objectStore.openCursor().onsuccess = function(e){

            const cursor = e.target.result;

            if(cursor){
                const {mascota,propietario,telefono,hora,fecha,sintomas, id} = cursor.value;

                const divCita = document.createElement('DIV');
                divCita.classList.add('cita','p-3');
                divCita.dataset.id = id; 

                const mascotaParrafo = document.createElement('H2');
                mascotaParrafo.classList.add('card-title','font-weight-bolder');
                mascotaParrafo.textContent = mascota;
                
                const propietarioParrafo = document.createElement('P');
                propietarioParrafo.innerHTML = `
                <span class="font-weight-bolder">Propietario : </span> ${propietario}
                `;
                
                const telefonoParrafo = document.createElement('P');
                telefonoParrafo.innerHTML = `
                <span class="font-weight-bolder">Telefono : </span> ${telefono}
                `;
                
                const horaParrafo = document.createElement('P');
                horaParrafo.innerHTML = `
                <span class="font-weight-bolder">Hora : </span> ${hora}
                `;
                
                const fechaParrafo = document.createElement('P');
                fechaParrafo.innerHTML = `
                <span class="font-weight-bolder">Fecha : </span> ${fecha}
                `;
                
                const sintomasParrafo = document.createElement('P');
                sintomasParrafo.innerHTML = `
                <span class="font-weight-bolder">Sintomas : </span> ${sintomas}
                `;

                const botonEliminar = document.createElement('button');
                botonEliminar.classList.add('btn','btn-danger','mr-2');
                botonEliminar.innerHTML = `Eliminar <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>`;

                botonEliminar.onclick = () => eliminarCita(id);

                const botonEditar = document.createElement('button');
                botonEditar.classList.add('btn','btn-info','mr-2');
                botonEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>`;
                const cita = cursor.value;
                botonEditar.onclick = () => cargarEdicion(cita);

                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(botonEliminar);
                divCita.appendChild(botonEditar);

                contenedorCitas.appendChild(divCita);

                //ve al siguiente elemento
                cursor.continue();
            }

        }
   }

   limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
   }
}

const administrarCitas = new Citas();
const ui = new UI(administrarCitas);
// ui.imprimirCitas(); 

function nuevaCita(e) {
    e.preventDefault();

    const {mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

    // Validar
    if( mascota === '' || propietario === '' || telefono === '' || fecha === ''  || hora === '' || sintomas === '' ) {
        ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error')

        return;
    }

    if(editando) {
        // Estamos editando
        administrarCitas.editarCita( {...citaObj} );

        const transaction = DB.transaction(['citas'],'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Guardado Correctamente');

            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            editando = false;
        }

        transaction.onerror = () =>{
            console.log('Hubo un error');
        }

        

    } else {
        // Nuevo Registro

        // Generar un ID único  
        citaObj.id = Date.now();
        
        // Añade la nueva cita
        administrarCitas.agregarCita({...citaObj});

        //insertar registro en indexDB   
        //creo la transaccion
        const transaction = DB.transaction(['citas'],'readwrite');
        //habilito el object store
        const objectStore = transaction.objectStore('citas');
        //inserto en el object store
        const peticion = objectStore.add(citaObj);

        //si tuvo exito
        transaction.oncomplete = function () {
            console.log('cita agregada a DB');
            //debo refresh la base para verlo, pero si se agrega
            
        // Mostrar mensaje de que todo esta bien...
        ui.imprimirAlerta('Se agregó correctamente')
        }
        transaction.onerror = () => {
            console.log('Hubo un error!');
        }

    }


    // Imprimir el HTML de citas
    ui.imprimirCitas();

    // Reinicia el objeto para evitar futuros problemas de validación
    reiniciarObjeto();

    // Reiniciar Formulario
    formulario.reset();

}

function reiniciarObjeto() {
    // Reiniciar el objeto
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


function eliminarCita(id) {
    
    const transaction = DB.transaction(['citas'],'readwrite');
    const objectStore = transaction.objectStore('citas');

    const resultado = objectStore.delete(id);

    transaction.oncomplete = () =>{

        console.log(`cita ${id} eliminada...`);
        administrarCitas.eliminarCita(id);
        ui.imprimirCitas()
        
    }

    transaction.onerror = () => {
        console.log('Hubo un error...');
    }

}

function cargarEdicion(cita) {

    const {mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

    // Reiniciar el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    // Llenar los Inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;

}


function crearDB(){

    //crear BD version 1.0
                                    //nombre y version
    const crearDB = window.indexedDB.open('citas',1);

    crearDB.onerror = function(){
        console.log('Algo ha fallado...');
    }

    crearDB.onsuccess = function(){
        console.log('Todo OK'); 

        DB = crearDB.result;    //instancia de la base de datos

        // console.log(DB);

        //mostrar citas al cargar pero indexdb ya esta listo
        ui.imprimirCitas();

    }

    //definir el schema

    crearDB.onupgradeneeded = function(e){
        const db = e.target.result;     //also instancia de la base de datos
        //defino mi base de datos, diciendole cual definire y con las llaves
        const objectStore = db.createObjectStore('citas', {
            keypath: 'id',              //el pilar sera el id que se va incrementando
            autoIncrement : true
        });
        //definir todas las columnas con nombre y keypath

        objectStore.createIndex('mascota','mascota', {unique:false});
        objectStore.createIndex('propietario','propietario', {unique:false});
        objectStore.createIndex('telefono','telefono', {unique:false});
        objectStore.createIndex('hora','hora', {unique:false});
        objectStore.createIndex('fecha','fecha', {unique:false});
        objectStore.createIndex('sintomas','sintomas', {unique:false});
        objectStore.createIndex('id','id', {unique:true});
        
        console.log('DataBase creada y lista');
    }

}   