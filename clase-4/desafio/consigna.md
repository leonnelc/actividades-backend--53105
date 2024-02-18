# Consigna
Desarrollar un servidor basado en express donde podamos hacer consultas a nuestro archivo de productos.

# Aspectos a incluir 

- Se deberá utilizar la clase ProductManager que actualmente utilizamos con persistencia de archivos. 
- Desarrollar un servidor express que, en su archivo app.js importe al archivo de ProductManager que actualmente tenemos.
- El servidor debe contar con los siguientes endpoints:
    - ruta ‘/products’, la cual debe leer el archivo de productos y devolverlos dentro de un objeto. Agregar el soporte para recibir por query param el valor ?limit= el cual recibirá un límite de resultados.
        - Si no se recibe query de límite, se devolverán todos los productos
        - Si se recibe un límite, sólo devolver el número de productos solicitados
    - ruta ‘/products/:pid’, la cual debe recibir por req.params el pid (product Id), y devolver sólo el producto solicitado, en lugar de todos los productos.
# Formato del entregable
Link al repositorio de Github con el proyecto completo, el cual debe incluir:
- carpeta src con app.js dentro y tu ProductManager dentro.
- package.json con la info del proyecto.
- NO INCLUIR LOS node_modules
generados.
# Proceso de testing
- Se instalarán las dependencias a partir del comando npm install
- Se echará a andar el servidor
- Se revisará que el archivo YA CUENTE CON AL MENOS DIEZ PRODUCTOS CREADOS al momento de su entrega, es importante para que los tutores no tengan que crear los productos por sí mismos, y así agilizar el proceso de tu evaluación.
- Se corroborará que el servidor esté corriendo en el puerto 8080.
- Se mandará a llamar desde el navegador a la url http://localhost:8080/products sin query, eso debe devolver todos los 10 productos.
- Se mandará a llamar desde el navegador a la url http://localhost:8080/products?limit=5 , eso debe devolver sólo los primeros 5 de los 10 productos.
- Se mandará a llamar desde el navegador a la url http://localhost:8080/products/2, eso debe devolver sólo el producto con id=2.
- Se mandará a llamar desde el navegador a la url http://localhost:8080/products/34123123, al no existir el id del producto, debe devolver un objeto con un error indicando que el producto no existe.