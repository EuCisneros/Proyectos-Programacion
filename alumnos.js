vue.component('v-select-inscripciones', vueSelect.vueSelect);
vue.component('component-alumnos', {
    data: () => {
        return {
            accion: 'nuevo',
            msg: '',
            status: false,
            error: false,
            buscar: "",
            alumno: {
                idalumno: 0,
                matricula: {
                    id: 0,
                    label: ''
                },
                codigo: '',
                nombre: '',
                fechan: '',
                genero: '',
                direccion: '',
                municipio: '',
                departamento: ''
            },
            alumnos: [],
            matricula: []

        }

    },
    methods: {
        buscandoAlumno() {
            this.alumnos = this.alumnos.filter((element, index, alumnos) => element.nombre.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0);
            if (this.buscar.length <= 0) {
                this.Obtenerdatos();
            }
        },
        BuscandoCodigoAlumno(store) {
            let buscarCodigo = new promise((resolver, rechazar) => {
                let index = store.index("codigo"),
                    data = index.get(this.alumno.codigo)
                data.onsuccess = evt => {
                    resolver(data);
                };
                data.onerror = evt => {
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guadarAlumnos() {
            let store = this.abrirStore("tblalumnos", 'readwrite'),
                duplicado = false;
            if (this.accion == 'nuevo') {
                this.alumno.idalumno = generaridunicodesdefecha();
                let data = await this.BuscandoCodigoAlumno(store);
                duplicado = data.result != undefined;
            }
            if (duplicado == false) {
                let query = store.put(this.alumno);
                query.onsuccess = event => {
                    this.Obtenerdatos();
                    this.limpiar();

                    this.mostrarMsg('registro guardado', false);
                };
                query.onerror = event => {
                    this.mostrarMsg('Error al guardar', true);
                    console.log(event);
                };
            } else {
                this.mostrarMsg('codigo alumno duplicado', true);
            }
        },
        mostrarMsg(msg, error) {
            this.status = true;
            this.msg = msg;
            this.error = error;
            this.quitarMsg(3);
        },
        quitarMsg(time) {
            setTimeout(() => {
                this.status = true;
                this.msg = '',
                    this.error = false;

            }, time * 1000);
        },
        Obtenerdatos() {

            let store = this.abrirStore('tblalumnos', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp => {
                this.alumnos = data.result;
            };
            let storeInscripcion = this.abrirStore('tblinscripcion', 'readonly'),
                dataInscripcion = storeInscripcion.getAll();
            this.inscripciones = [];
            dataInscripcion.onsuccess = resp => {
                this.inscripciones.result.forEach(element => {
                    this.inscripciones.push({ id: element.id, label: element.nombre });
                });
            };
        },
        limpiar() {
            this.accion = 'nuevo';
            this.alumno.categoria.id = 0;
            this.alumno.categoria.label = "";
            this.alumno.idalumno = '';
            this.alumno.codigo = '';
            this.alumno.nombre = '';
            this.alumno.fechan = '';
            this.alumno.genero = '';
            this.alumno.direccion = '';
            this.alumno.municipio = '';
            this.alumno.departamento = '';
            this.Obtenerdatos();
        },
        eliminarDatos(alu) {
            if (confirm('estas seguro eliminar: ${alu.nombre}')) {
                let store = this.abrirStore("tblalumnos", 'readwrite'),
                    req = store.delete(alu.idalumno);
                req.onsuccess = resp => {
                    this.mostrarMsg('registrado', true);
                    this.Obtenerdatos();
                };
            }
        },
        abrirStore(store, modo) {
            let tx = db.transaction(store);
        }
    },
    create() {

    },



});