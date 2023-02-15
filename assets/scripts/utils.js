// Construct an array by repeating `pattern` n times
/*
 * @param {number} n - number of times to repeat
 * @param {array} pattern - array to repeat
 * @returns {array} - array of repeated pattern
 *
 * @example
 * repeat(3, [1, 2, 3]) -> [
 *   1, 2, 3,
 *   1, 2, 3,
 *   1, 2, 3
 * ]
 *
 */
export function repeat(n, pattern) {
  return [...Array(n)].reduce((sum) => sum.concat(pattern), []);
}

// Create a buffer and bind it
/*
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {GLenum} target - the type of buffer to create (ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER)
 * @param {ArrayBufferView | null} data - the data to store in the buffer
 * @param {GLenum} usage - the expected usage pattern of the data store (STATIC_DRAW, STREAM_DRAW, DYNAMIC_DRAW)
 * @returns {WebGLBuffer} - the created buffer
 *
 * @example
 * createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)
 */
export function createBuffer(gl, target, data, usage) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, usage);
  return buffer;
}

// Load Texture
/*
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} url - url of the image to load
 * @returns {WebGLTexture} - the created texture
 *
 * @example
 * loadTexture(gl, 'assets/images/texture.png')
 */
export function loadTexture(gl, url) {
  const texture = gl.createTexture();
  const image = new Image();

  image.onload = (e) => {
    // Bind the texture to the texture unit
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Specify a 2D texture image
    // texImage2D(target, level, internalformat, format, type, pixels)
    // target - the target texture (TEXTURE_2D, TEXTURE_CUBE_MAP_POSITIVE_X, etc.)
    // level - the level-of-detail number. Level 0 is the base image level. Level n is the nth mipmap reduction image
    // internalformat - the number of color components in the texture
    // format - the format of the texel data
    // type - the data type of the texel data
    // pixels - the texel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };

  image.src = url;
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// Create a shader
/*
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {GLenum} type - the type of shader to create (VERTEX_SHADER, FRAGMENT_SHADER)
 * @param {string} source - the shader source code
 * @returns {WebGLShader} - the created shader
 *
 * @example
 * createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
 * createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
 */
export function createShader(gl, type, source) {
  // Create a shader object
  const shader = gl.createShader(type);

  // Set the shader source code
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  // If it didn't compile, get the error
  // and delete the shader
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// Enable attribute
/*
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLProgram} program - the program containing the attribute
 * @param {string} name - the name of the attribute
 * @param {WebGLBuffer} buffer - the buffer containing the data
 * @param {number} size - the number of components per attribute
 * @param {GLenum} type - the data type of each component in the array
 * @param {boolean} normalized - whether integer data values should be normalized
 * @param {number} stride - the offset in bytes between the beginning of consecutive vertex attributes
 * @param {number} offset - the offset in bytes of the first component in the vertex attribute array
 * @returns {number} - the location of the attribute
 *
 * @example
 * addAttribute(gl, program, 'a_position', 3, gl.FLOAT, false, 0, 0)
 */
export function enableAttribute(
  gl,
  program,
  name,
  buffer,
  size = 3,
  type = gl.FLOAT,
  normalized = false,
  stride = 0,
  offset = 0
) {
  const attribute = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // For some reason, this is neede (?)
  gl.vertexAttribPointer(attribute, size, type, normalized, stride, offset);

  return attribute;
}

// get mouse
/*
 * @param {number} x - the x position of the mouse
 * @returns {number} - the normalized x position of the mouse
 *
 * @example
 * getMouseX(0) // -1
 */
export function getMouseX(x) {
  return (x / window.innerWidth) * 2 - 1;
}

// create a function that handles what image shows up when the mouse is over the canvas
/*
 * @param {MouseEvent} e - the mouse event
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} min - the minimum value of the texture index
 * @param {number} max - the maximum value of the texture index
 * @returns {void}
 *
 * @example
 * handleImageShown(e, gl, 1, 5)
 */
export function handleImageShown(e, gl, min = 1, max) {
  const x = getMouseX(e.clientX);

  const textureIndex = Math.floor(((x + min) * max) / 2);

  if (textureIndex === 0) return;
  const texture = loadTexture(gl, `assets/images/image-${textureIndex}.webp`);
  console.log(Date.now(), "{{ handleImageShown }}", texture);
}
