Vue.component('v-select-matriculas', VueSelect.VueSelect);
Vue.component('component-materias',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            materias:{
                idMatreias  : 0,
                matriculas : {
                    id : 0,
                    label : '' 
                },
                codigo      : '',
                descripcion : '',
                precio      : ''
            },
            materias:[],
            matriculas:[]
        }
    },
    methods:{
        buscandoMatrerias(){
            this.materias = this.materias.filter((element,index,materias) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerDatos();
            }
        },
        buscandoCodigoMaterias(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.materias.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarMaterias(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tblmaterias",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.materias.idMaterias = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoMaterias(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.materias);
                query.onsuccess=event=>{
                    this.obtenerDatos();
                    this.limpiar();
                    
                    this.mostrarMsg('Registro se guardo con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el registro',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de materia duplicado',true);
            }
        },
        mostrarMsg(msg, error){
            this.status = true;
            this.msg = msg;
            this.error = error;
            this.quitarMsg(3);
        },
        quitarMsg(time){
            setTimeout(()=>{
                this.status=false;
                this.msg = '';
                this.error = false;
            }, time*1000);
        },
        obtenerDatos(){
            let store = this.abrirStore('tblmaterias','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.materias = data.result;
            };
            let storeMatriculas = this.abrirStore('tblmatriculas','readonly'),
                dataMaterias = storeMaterias.getAll();
            this.materias = [];
            dataMaterias.onsuccess=resp=>{
                dataMaterias.result.forEach(element => {
                    this.materias.push({id:element.idCategoria, label:element.descripcion});
                });
                
            };
        },
        mostrarMaterias(pro){
            this.materias = pro;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.materias.matriculas.id=0;
            this.materias.matriculas.label="";
            this.materias.idMaterias='';
            this.materias.codigo='';
            this.materias.descripcion='';
            this.materias.precio='';
            this.obtenerDatos();
        },
        eliminarMatriculas(pro){
            if( confirm(`Esta seguro que desea eliminar la materia:  ${pro.descripcion}`) ){
                let store = this.abrirStore("tblmaterias",'readwrite'),
                    req = store.delete(pro.idMaterias);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Registro eliminado con exito',true);
                    this.obtenerDatos();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el registro',true);
                    console.log( resp );
                };
            }
        },
        abrirStore(store,modo){
            let tx = db.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        //this.obtenerDatos();
    },
    template:`
        <form v-on:submit.prevent="guardarMaterias" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE MATERIAS/h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['materias'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">MATRICULAS:</div>
                        <div class="col-sm">
                            <v-select-matriculas v-model="materias.matriculas" :options="matriculas" placeholder="Por favor seleccione la matriculas"/>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CODIGO:</div>
                        <div class="col-sm">
                            <input v-model="materias.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DESCRIPCION: </div>
                        <div class="col-sm">
                            <input v-model="materias.descripcion" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">PRECIO:</div>
                        <div class="col-sm">
                            <input v-model="materias.precio" required pattern="^[0-9](.)+?[0-9]$" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm text-center">
                            <input type="submit" value="Guardar" class="btn btn-dark">
                            <input type="reset" value="Limpiar" class="btn btn-warning">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm text-center">
                            <div v-if="status" class="alert" v-bind:class="[error ? 'alert-danger' : 'alert-success']">
                                {{ msg }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm"></div>
                <div class="col-sm-6 p-2">
                    <div class="row text-center text-white bg-primary">
                        <div class="col"><h5>MATERIAS REGISTRADAS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoMaterias" type="text" class="form-control form-contro-sm" placeholder="Buscar materias">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>DESCRIPCION</th>
                                        <th>PRECIO</th>
                                        <th>MATRICULAS</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="pro in materias" v-on:click="mostrarMaterias(pro)">
                                        <td>{{ pro.codigo }}</td>
                                        <td>{{ pro.descripcion }}</td>
                                        <td>{{ pro.precio }}</td>
                                        <td>{{ pro.matriculas.label }}</td>
                                        <td>
                                            <a @click.stop="eliminarMaterias(pro)" class="btn btn-danger">DEL</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
});