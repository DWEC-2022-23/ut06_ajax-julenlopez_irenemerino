var arrayInvitados = new Array();//Tengo variable datos checkar
var idEditandose;//Por ahora podria mantenerlo

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');

  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');

  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');

  var datos;//Podemos usarlo, lo dejo en tus manos Ire

  filterLabel.textContent = "Ocultar los que no hayan respondido";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);
  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';
        } else {
          li.style.display = 'none';
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }
    }
  });

  function createLI(text, bool) {
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);
      element[property] = value;
      return element;
    }

    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);
      li.appendChild(element);
      return element;
    }

    const li = document.createElement('li');
    appendToLI('span', 'textContent', text);
    appendToLI('label', 'textContent', 'Confirmed')
      .appendChild(createElement('input', 'type', 'checkbox'));
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');

    //Ya que no se como hacerlo arriba nos movemos por el arbol de hijos y le asignamos el checked a true
    if (bool) {
      li.childNodes[1].childNodes[1].checked = true;
    }
    return li;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    const li = createLI(text);
    ul.appendChild(li);
    create(text);
  });

  ul.addEventListener('change', (e) => {
    const checkbox = event.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    const li = checkbox.parentNode.parentNode;
    let aux;
    if(li.firstElementChild.tagName.toLowerCase()=="span")
      aux = li.firstElementChild.textContent;
    else
      aux = li.firstElementChild.value;

    idEditandose = getIdInvitado(aux, arrayInvitados);

    console.log(li)

    let invitado = new Invitados(aux, li.querySelector("label").querySelector("input").checked, idEditandose);
    update(invitado.id, invitado.nombre, invitado.confirmado);
  });

  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent;
      const nameActions = {
        remove: () => {
          //TODO delete(text);
          const span = li.firstElementChild;
          borrar(getIdInvitado(span.textContent, arrayInvitados));
          ul.removeChild(li);
        },
        edit: () => {
          //Recojemos en este evento el id del invitado a editar
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          idEditandose = getIdInvitado(span.textContent, arrayInvitados);
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save';
        },
        save: () => {
          const input = li.firstElementChild;
          const span = document.createElement('span');
          let repetido = false;
          span.textContent = input.value;
          idEditandose = getIdInvitado(span.textContent, arrayInvitados);
          //Comprobamos que no se haya creado un invitado con ese nombre
          arrayInvitados.forEach(invitado => {
            if (span.textContent == invitado.nombre && span.textContent != arrayInvitados[arrayInvitados.indexOf(invitado)].nombre){
              repetido = true;
            }
          });
          //Si es un invitado nuevo procedemos a editarlo posible problema a la hora de cambiar al nombre original
          if (!repetido) {
            li.insertBefore(span, input);
            li.removeChild(input);
            button.textContent = 'edit';
            // span recoge contenido que han introducido y el valor del checked para poder modificarlo. 

            let invitado = new Invitados(span.textContent, li.querySelector("label").querySelector("input").checked, idEditandose);
            // Oye padre dame a tus hijos y entre tus hijos dime cual soy yo. 
            //console.log(invitado)
            update(invitado.id, invitado.nombre, invitado.confirmado);
          } else {
            alert("Persona ya incluida")
          }
          //PREGUNTAR CARLOS PORQUE NO LE DA TIEMPO A EJECUTARSE
        }
      };

      // select and run action in button's name
      nameActions[action]();
    }
  });

  //Funcion que muestra la Lista de invitados. 
  function datosInciales() {
    const xhttp = new XMLHttpRequest();
    const url = 'http://localhost:3000/invitados';
    xhttp.open('GET', url, true);
    xhttp.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {
        datos = JSON.parse(this.response);
        //console.log(datos);
        for (let item of datos) {
          //Creamos el array con todos los objetos JSON
          arrayInvitados.push(item);
          let muestraLista = createLI(item.nombre, item.confirmado);
          ul.appendChild(muestraLista);
        }
      }
    };
    xhttp.send();
  }
  datosInciales();
  //OPERACIONES CRUD
  //Funcion que CREA y GUARDA un nuevo invitado. 
  function create(text) {
    const url = 'http://localhost:3000/invitados';
    fetch(url, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(new Invitados(text, false))
    })
      .then(function (response) {
        // Transforma la respuesta. En este caso lo convierte a JSON
        return response.json();
      })
      .then(function (json) {
        // Usamos la información recibida como necesitemos
        console.log(json);
      });
  }
  //Funcion UPDATE.
  function update(id, nombre, bool) {
    let url = 'http://localhost:3000/invitados/' + id;


    fetch(url, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(new Invitados(nombre, bool))
    })
      .then(function (response) {
        // Transforma la respuesta. En este caso lo convierte a JSON
        return response.json();
      })
      //Promise
      .then(function (json) {
        // Usamos la información recibida como necesitemos
        console.log(json);
      });
  }
  //Funcion DELETE.
  function borrar(id) {
    let url = 'http://localhost:3000/invitados/' + id;
    fetch(url, {
      headers: {
        'Content-type': 'application/json'
      },
      method: 'DELETE',
    })
      .then(function (response) {
        // Transforma la respuesta. En este caso lo convierte a JSON
        return response.json();
      })
      //Promise
      .then(function (json) {
        // Usamos la información recibida como necesitemos
        console.log(json);
      });
  }

  function getIdInvitado(text, array) {
    let aux = null
    array.forEach(arr => {
      if (text == arr.nombre) {
        aux = arr.id;
      }
    });
    return aux;
  }
});








