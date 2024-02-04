// Ссылка на элемент веб страницы в котором будет отображаться графика
var container;
var Mesh;
// Переменные "камера", "сцена" и "отрисовщик"
var camera, scene, renderer;
var N = 255;
var imagedata;
// Функция инициализации камеры, отрисовщика, объектов сцены и т.д.
init();
// Обновление данных по таймеру браузера
animate();

// В этой функции можно добавлять объекты и выполнять их первичную настройку
function init()
{
 container = document.getElementById( 'container' );

 scene = new THREE.Scene();

 camera = new THREE.PerspectiveCamera(
 45, window.innerWidth / window.innerHeight, 1, 4000 );

 camera.position.set(N/2, N/2, N*1.5);


 camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2)); 

 renderer = new THREE.WebGLRenderer( { antialias: false } );
 renderer.setSize( window.innerWidth, window.innerHeight );

//  renderer.setAnimationLoop( animate );

 renderer.setClearColor( 0x000000ff, 1);
 container.appendChild( renderer.domElement );
 
 //создание точечного источника освещения заданного цвета
 var spotlight = new THREE.PointLight(0xffffff);
 //установка позиции источника освещения
 spotlight.position.set(N*1.5, N, N/2);
 //добавление источника в сцену
 scene.add(spotlight);

 window.addEventListener( 'resize', onWindowResize, false );

 var canvas = document.createElement('canvas');
 var context = canvas.getContext('2d');
 var img = new Image();
 img.onload = function()
 {
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0 );
  imagedata = context.getImageData(0, 0, img.width, img.height);
  // Пользовательская функция генерации ландшафта
  makeTerrain();
 }
 // Загрузка изображения с картой высот
 img.src = 'sprites/plateau.jpg';
}

function getPixel( imagedata, x, y )
{
 var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
 return data[ position ];;
}

function onWindowResize()
{
 // Изменение соотношения сторон для виртуальной камеры
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 // Изменение соотношения сторон рендера
 renderer.setSize( window.innerWidth, window.innerHeight );
}

// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate(time)
{
 requestAnimationFrame( animate );
 Mesh.rotation.y = time / 10000;
 render();
}

function render()
{
 renderer.render( scene, camera );
}

function makeTerrain() 
{ 
    var vertices = []; 
    var faces = []; 
    var colors = [];
    
    var uvs = []; // Массив для хранения текстурных координат

    var geometry = new THREE.BufferGeometry();
 
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) 
        { 
            var h = getPixel( imagedata, i, j );
            vertices.push(i, h/10.0, j); // Добавление координат первой вершины в массив вершин 
            colors.push(0.8, 8.0, 8.0); // Добавление цвета для первой вершины (красный) 
            uvs.push(i/(N-1), j/(N-1));
        } 
    }
 
    for (var i = 0; i < N-1; i++){
        for (var j = 0; j < N-1; j++) 
        { 
            faces.push(i+j*N, (i+1)+j*N, (i+1)+(j+1)*N); // Добавление индексов (порядок соединения вершин) в массив индексов 
            faces.push(i+j*N, (i+1)+(j+1)*N, i+(j+1)*N); // Добавление индексов (порядок соединения вершин) в массив индексов 
        } 
    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) ); 
    geometry.setIndex( faces ); 
 
    //Добавление цветов вершин в геометрию 
    // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) ); 
    
    geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

    geometry.computeVertexNormals();

    // Загрузка текстуры yachik.jpg из папки pics
    var tex = new THREE.TextureLoader().load('sprites/landtile.jpg');

    var triangleMaterial = new THREE.MeshLambertMaterial({ 
        map:tex, 
        wireframe: false, 
        side:THREE.DoubleSide 
    }); 
 
    Mesh = new THREE.Mesh(geometry, triangleMaterial); 
    Mesh.position.set(0.0, 0.0, 0.0);
    var center = new THREE.Vector3();
    Mesh.geometry.computeBoundingBox();
    Mesh.geometry.boundingBox.getCenter(center);
    Mesh.geometry.center();
    Mesh.position.copy(center);
 
    // Добавление объекта в сцену 
    scene.add(Mesh); 
}
