
class Invitados{
    
    constructor(nombre,confirmado,id=null){
        this.nombre= nombre; 
        this.confirmado=confirmado;
        if(id!=null){
            this.id=id;
        }
    }
    setId(id){
        this.id=id;
    }
    
}