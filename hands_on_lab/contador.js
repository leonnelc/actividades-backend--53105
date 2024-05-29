class Contador {
    static #cuentaGlobal = 0;
    #responsable;
    #cuenta;
    constructor(responsable){
        this.#responsable = responsable;
        this.#cuenta = 0;
    }
    contar(){
        this.#cuenta++;
        Contador.#cuentaGlobal++;
    }
    static get cuentaGlobal(){
        return Contador.#cuentaGlobal;
    }
    get cuentaIndividual(){
        return this.#cuenta;
    }
    get responsable(){
        return this.#responsable;
    }
}


// Pruebas
contadorDeJuan = new Contador("Juan");

contadorDePepe = new Contador("Pepe");

contadorDeJuan.contar();
contadorDeJuan.contar();
contadorDePepe.contar();

console.log(`${contadorDeJuan.responsable}: ${contadorDeJuan.cuentaIndividual}`);
console.log(`${contadorDePepe.responsable}: ${contadorDePepe.cuentaIndividual}`);
console.log(`Cuenta global: ${Contador.cuentaGlobal}`);