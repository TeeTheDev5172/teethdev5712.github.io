// maze.js

// Initialize WebGL context
const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
    console.error('WebGL not supported');
}

// Define vertex and fragment shader source code
const vertexShaderSource = `
    attribute vec3 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

// Compile shaders
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

// Create and link shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
}

// Use shader program
gl.useProgram(shaderProgram);

// Define vertex data
const vertices = [
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.0, 0.5, 0.0
];
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Get attribute location and enable it
const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

// Main render loop
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}
render();

// Keyboard input handling
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    switch (key) {
        case 'w':
            // Move forward
            break;
        case 's':
            // Move backward
            break;
        case 'a':
            // Strafe left
            break;
        case 'd':
            // Strafe right
            break;
        default:
            break;
    }
});

