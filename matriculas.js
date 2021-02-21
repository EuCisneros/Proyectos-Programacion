Vue.component('component-matriculas',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            matriculas:{
                idMatriculas  : 0,
                codigo      : '',
                descripcion : ''
            },
            matriculas:[]
        }
    },
    methods:{
        buscandoMatriculas(){
            this.matriculas = this.matriculas.filter((element,index,categorias) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerDatos();
            }
        },
        buscandoCodigoMatriculas(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.matriculas.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarMatriculas(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tblmatriculas",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.matriculas.idMatriculas = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoMatriculas(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.matriculas);
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
                this.mostrarMsg('Codigo de categoria duplicado',true);
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
            let store = this.abrirStore('tblmatriculas','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.matriculas = data.result;
            };
        },
        mostrarMatriculas(pro){
            this.matriculas = pro;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.matriculas.idMatriculas='';
            this.matriculas.codigo='';
            this.matriculas.descripcion='';
            this.obtenerDatos();
        },
        eliminarMatriculas(pro){
            if( confirm(`Esta seguro que desea eliminar el matriculas:  ${pro.descripcion}`) ){
                let store = this.abrirStore("tblmatriculas",'readwrite'),
                    req = store.delete(pro.idMatriculas);
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
        <form v-on:submit.prevent="guardarMatriculas" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE MATRICULAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['MATRICULAS'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CODIGO:</div>
                        <div class="col-sm">
                            <input v-model="matriculas.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DESCRIPCION: </div>
                        <div class="col-sm">
                            <input v-model="matriculas.descripcion" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
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
                        <div class="col"><h5>MATRICULAS REGISTRADOS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoMatriculas" type="text" class="form-control form-contro-sm" placeholder="Buscar matriculas">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>DESCRIPCION</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="pro in matriculas" v-on:click="mostrarMatriculas(pro)">
                                        <td>{{ pro.codigo }}</td>
                                        <td>{{ pro.descripcion }}</td>
                                        <td>
                                            <a @click.stop="eliminarMatriculas(pro)" class="btn btn-danger">DEL</a>
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