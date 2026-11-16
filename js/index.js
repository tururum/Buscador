/*
 * Funciones del buscador de bienes raíces.
 * Los datos generales se cargan desde data-1.json y se filtran en el navegador.
 */
(function () {
  var datosGenerales = [];
  var slider;

  function precioNumerico(precio) {
    return Number(String(precio).replace(/[$,\s]/g, ""));
  }

  function escapar(valor) {
    return String(valor).replace(/[&<>'"]/g, function (caracter) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[caracter];
    });
  }

  function llenarSelect(selector, valores, textoInicial) {
    var $select = $(selector);
    $select.empty().append($('<option>', {
      value: "",
      text: textoInicial
    }));

    valores.sort().forEach(function (valor) {
      $select.append($('<option>', { value: valor, text: valor }));
    });

    // Materialize convierte los select en una lista propia, por lo que debe
    // actualizarse después de agregar las opciones.
    $select.material_select();
  }

  function inicializarSlider() {
    var precios = datosGenerales.map(function (registro) {
      return precioNumerico(registro.Precio);
    });
    var minimo = Math.min.apply(null, precios);
    var maximo = Math.max.apply(null, precios);

    $("#rangoPrecio").ionRangeSlider({
      type: "double",
      grid: false,
      min: minimo,
      max: maximo,
      from: minimo,
      to: maximo,
      prefix: "$",
      prettify: function (numero) {
        return Number(numero).toLocaleString("en-US");
      }
    });
    slider = $("#rangoPrecio").data("ionRangeSlider");
  }

  function mostrarResultados(registros) {
    var $resultados = $("#resultados");
    $resultados.empty();

    if (!registros.length) {
      $resultados.html('<div class="card mensajeResultados">No se encontraron propiedades con esos criterios.</div>');
      return;
    }

    registros.forEach(function (registro) {
      $resultados.append(
        '<article class="itemMostrado card">' +
          '<div class="card-stacked">' +
            '<div class="card-content">' +
              '<span class="card-title">' + escapar(registro.Tipo) + '</span>' +
              '<p><strong>Dirección:</strong> ' + escapar(registro.Direccion) + '</p>' +
              '<p><strong>Ciudad:</strong> ' + escapar(registro.Ciudad) + '</p>' +
              '<p><strong>Teléfono:</strong> ' + escapar(registro.Telefono) + '</p>' +
              '<p><strong>Código postal:</strong> ' + escapar(registro.Codigo_Postal) + '</p>' +
            '</div>' +
            '<div class="card-action"><span class="precioTexto">' + escapar(registro.Precio) + '</span></div>' +
          '</div>' +
        '</article>'
      );
    });
  }

  function filtrarResultados() {
    var rango = slider ? slider.result : { from: 0, to: Infinity };
    var ciudad = $("#selectCiudad").val();
    var tipo = $("#selectTipo").val();

    var resultados = datosGenerales.filter(function (registro) {
      var precio = precioNumerico(registro.Precio);
      return precio >= rango.from && precio <= rango.to &&
        (!ciudad || registro.Ciudad === ciudad) &&
        (!tipo || registro.Tipo === tipo);
    });

    mostrarResultados(resultados);
  }

  function cargarDatos() {
    $.getJSON("data-1.json")
      .done(function (datos) {
        datosGenerales = datos;
        llenarSelect("#selectCiudad", datos.map(function (registro) { return registro.Ciudad; }).filter(function (valor, indice, lista) {
          return lista.indexOf(valor) === indice;
        }), "Elige una ciudad");
        llenarSelect("#selectTipo", datos.map(function (registro) { return registro.Tipo; }).filter(function (valor, indice, lista) {
          return lista.indexOf(valor) === indice;
        }), "Elige un tipo");
        inicializarSlider();

        // Mostrar Todos no depende de los filtros seleccionados.
        $("#mostrarTodos").on("click", function () {
          mostrarResultados(datosGenerales);
        });
        $("#formulario").on("submit", function (evento) {
          evento.preventDefault();
          filtrarResultados();
        });
      })
      .fail(function () {
        $("#resultados").html('<div class="card mensajeResultados">No se pudieron cargar los datos generales.</div>');
      });
  }

  cargarDatos();
})();
