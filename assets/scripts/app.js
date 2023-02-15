import fragmentShaderSrc from "./shaders/pepitos/fragment.shader.js";
import vertexShaderSrc from "./shaders/pepitos/vertex.shader.js";

import {
  repeat,
  loadTexture,
  createShader,
  enableAttribute,
  handleImageShown,
} from "./utils.js";

const canvas = document.querySelector(".pepitos");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get canvas context
const gl = canvas.getContext("webgl");

// Canvas context types and uses and definitions
// 2d       - used for drawing images and shapes
// webgl    - used for drawing 3d objects
// webgl2   - used for drawing 3d objects

if (!gl) {
  console.error("WebGL not supported");
  // fallback to 2d
}

// Create vertex data
// vertex data is the data that defines the shape of the object

// prettier-ignore
const vertexData = repeat(1, [
  0.5, 0.5, 0.5, // top right 
  0.5, -.5, 0.5, // bottom right
  -.5, 0.5, 0.5, // top left

  -.5, 0.5, 0.5, // top left
  0.5, -.5, 0.5, // bottom right
  -.5, -.5, 0.5, // bottom left
])

// prettier-ignore
const uvData = repeat(1, [
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
])

// Create a buffer and bind it
// A buffer is a memory location on the GPU that stores data
// The data can be vertex data, color data, etc.

// .createBuffer() creates a buffer

// .bindBuffer(target, object) binds the buffer to a target
// target - the type of buffer to create (ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER)
// object - the object to bind the buffer to (gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER)

// .bufferData(target, data, usage) creates and initializes the buffer's data store
// target - the type of buffer to create (ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER)
// data - the data to store in the buffer
// usage - the expected usage pattern of the data store (STATIC_DRAW, STREAM_DRAW, DYNAMIC_DRAW)

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

// Load texture
const imageTexture = loadTexture(gl, "assets/images/image-1.webp");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip the image's y axis
gl.activeTexture(gl.TEXTURE0); // activate the texture unit
gl.bindTexture(gl.TEXTURE_2D, imageTexture); // bind the texture to the texture unit

/* 
    Fun fact:
    The texture unit is a state machine that stores the currently active texture.
    In webgl, there are 16 texture units, and each texture unit has a texture target.
    96 texture targets are available, but only 2 are commonly used:
        - TEXTURE_2D - 2d texture
        - TEXTURE_CUBE_MAP - cube map texture
*/

// Create a shader program
// A shader program is a program that runs on the GPU
// It is used to render graphics
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

// Create a program and attach the shaders
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// Link the program
gl.linkProgram(program);

// Enable attributes to the program
// Vertex attributes are the data that is passed to the vertex shader
// Vertex attributes are stored in buffers
// Vertex attributes are enabled by calling .enableVertexAttribArray(index)
// index - the index of the vertex attribute to enable

// prettier-ignore
const positionLocation = enableAttribute(gl, program, "position", positionBuffer, 3, gl.FLOAT, false, 0, 0);

// prettier-ignore
const uvLocation = enableAttribute(gl, program, "uv", uvBuffer, 2, gl.FLOAT, false, 0, 0);

console.log(positionLocation, uvLocation);

// useProgram() installs a program object as part of current rendering state
gl.useProgram(program);

// enable() enables a specific WebGL capability
// DEPTH_TEST is a capability that enables depth comparisons and updates to the depth buffer
gl.enable(gl.DEPTH_TEST);

// Create a uniform
// Uniforms are variables that are passed to the shader program
// Uniforms are used to pass data to the shader program
// Uniforms are created by calling .getUniformLocation(program, name)
// program - the program to get the uniform location from
// name - the name of the uniform

const uniformLocations = {
  textureID: gl.getUniformLocation(program, `textureID`),
};

// Set the value of a uniform variable for the current program object
gl.uniform1i(uniformLocations.textureID, 0);

function animate() {
  requestAnimationFrame(animate);

  gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();

// Events
const imageSequenceLength = 118;
canvas.addEventListener("mousemove", (e) =>
  handleImageShown(e, gl, 1, imageSequenceLength)
);
