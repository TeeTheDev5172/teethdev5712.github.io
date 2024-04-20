// Set up the scene
const scene = new THREE.Scene();

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 50, 0);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// UI Elements
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '10px';
uiContainer.style.left = '10px';
document.body.appendChild(uiContainer);

// Health Bar
const healthBar = document.createElement('div');
healthBar.style.width = '100px';
healthBar.style.height = '20px';
healthBar.style.backgroundColor = 'red';
healthBar.style.position = 'absolute';
healthBar.style.top = '10px';
healthBar.style.left = '10px';
uiContainer.appendChild(healthBar);

// Score Display
const scoreDisplay = document.createElement('div');
scoreDisplay.style.color = 'white';
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '40px';
scoreDisplay.style.left = '10px';
scoreDisplay.textContent = 'Score: 0';
uiContainer.appendChild(scoreDisplay);

// Game Over Message
const gameOverMessage = document.createElement('div');
gameOverMessage.style.color = 'red';
gameOverMessage.style.fontSize = '24px';
gameOverMessage.style.position = 'absolute';
gameOverMessage.style.top = '100px';
gameOverMessage.style.left = '50%';
gameOverMessage.style.transform = 'translateX(-50%)';
gameOverMessage.style.display = 'none';
gameOverMessage.textContent = 'Game Over!';
uiContainer.appendChild(gameOverMessage);

// Position camera to view the tunnel
camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);

// Create the initial tunnel segment
let tunnelSegments = [];
let startTime = Date.now(); // Timer for spike spawning
let score = 0;

addTunnelSegment();
updateScore();

function addTunnelSegment() {
    const tunnelGeometry = new THREE.CylinderGeometry(10, 10, 100, 32, 1, true);
    const tunnelMaterial = new THREE.MeshStandardMaterial({ color: getRandomColor(), side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    tunnel.rotation.x = Math.PI / 2;

    if (tunnelSegments.length > 0) {
        const prevSegment = tunnelSegments[tunnelSegments.length - 1];
        tunnel.position.z = prevSegment.position.z + prevSegment.geometry.parameters.height - 1;
    } else {
        tunnel.position.z = 0;
    }

    tunnel.receiveShadow = true;
    scene.add(tunnel);
    tunnelSegments.push(tunnel);

    addObstaclesAndSpikesToTunnel(tunnel); // Spawn obstacles and spikes for the new tunnel segment
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Create player
const playerGeometry = new THREE.BoxGeometry(2, 2, 2); // Bigger player
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.castShadow = true;
scene.add(player);

// Position player
player.position.z = -5;

// Keyboard controls
const keyboard = {};
document.addEventListener('keydown', (event) => {
    keyboard[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keyboard[event.code] = false;
});

// Function for precise collision detection
function checkCollision(player, tunnel) {
    const playerBox = new THREE.Box3().setFromObject(player);
    const tunnelBox = new THREE.Box3().setFromObject(tunnel);
    return playerBox.intersectsBox(tunnelBox);
}

// Animate the scene
const movementSpeed = 1;
const rotationSpeed = 0.1;
const tunnelSpeed = 1;
let health = 150;

const animate = () => {
    requestAnimationFrame(animate);

    // Update UI
    healthBar.style.width = health + 'px';
    scoreDisplay.textContent = `Score: ${score}`;

    // Player movement
    if (keyboard['ArrowUp']) {
        player.position.y += movementSpeed;
        if (player.position.y > 9) { // Ceiling collision detection
            console.log("Ceiling contact - move lower!");
            player.position.y = 9; // Prevents player from moving through the ceiling
        }
    }
    if (keyboard['ArrowDown']) {
        player.position.y -= movementSpeed;
        if (player.position.y < -9) { // Floor collision detection
            console.log("Floor contact - move higher!");
            player.position.y = -9; // Prevents player from moving below the floor
        }
    }
    if (keyboard['ArrowLeft']) {
        player.rotation.y -= rotationSpeed;
        const angle = player.rotation.y;
        player.position.x = Math.cos(angle) * 9; // Adjust for tunnel radius
        player.position.z = Math.sin(angle) * 9 - 5; // Adjust for player's initial position and tunnel radius

        // Check collision with tunnel
        for (const tunnel of tunnelSegments) {
            if (checkCollision(player, tunnel)) {
                console.log("Collision with tunnel!");
                // Handle collision here (e.g., prevent player from moving further)
                player.position.x = Math.cos(angle) * 9; // Revert player position
                player.position.z = Math.sin(angle) * 9 - 5;
            }
        }
    }
    if (keyboard['ArrowRight']) {
        player.rotation.y += rotationSpeed;
        const angle = player.rotation.y;
        player.position.x = Math.cos(angle) * 9; // Adjust for tunnel radius
        player.position.z = Math.sin(angle) * 9 - 5; // Adjust for player's initial position and tunnel radius

        // Check collision with tunnel
        for (const tunnel of tunnelSegments) {
            if (checkCollision(player, tunnel)) {
                console.log("Collision with tunnel!");
                // Handle collision here (e.g., prevent player from moving further)
                player.position.x = Math.cos(angle) * 9; // Revert player position
                player.position.z = Math.sin(angle) * 9 - 5;
            }
        }
    }

    // Collision detection with spikes
    for (const tunnel of tunnelSegments) {
        for (const child of tunnel.children) {
            if (checkCollision(player, child)) {
                console.log("Collision with spike!");
                // Handle collision here (e.g., game over, lose life)
                health -= 10;
                if (health <= 0) {
                    // Game over
                    console.log("Game Over!");
                    gameOver();
                }
            }
        }
    }

    // Tunnel movement
    for (const tunnel of tunnelSegments) {
        tunnel.position.z -= tunnelSpeed;
    }

    // Add new tunnel segment and obstacles/spikes
    if (tunnelSegments[tunnelSegments.length - 1].position.z <= 50) {
        addTunnelSegment();
    }

    // Update score every 10 seconds
    if ((Date.now() - startTime) >= 10000) {
        score += 5;
        startTime = Date.now();
        updateScore();
    }

    renderer.render(scene, camera);
};

// Function to add obstacles and spikes to the tunnel segment
function addObstaclesAndSpikesToTunnel(tunnel) {
    const spikeGeometry = new THREE.ConeGeometry(1.5, 8, 8);
    const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const numSpikes = 40; // Increased number of spikes for more challenge

    for (let i = 0; i < numSpikes; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        const angle = Math.random() * 2 * Math.PI;
        spike.position.x = Math.cos(angle) * 10;
        spike.position.y = Math.sin(angle) * 10;
        spike.position.z = Math.random() * 100 - 50;
        spike.lookAt(tunnel.position);
        tunnel.add(spike);
    }
}

// Function to update the score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Function to handle game over
function gameOver() {
    health = 150; // Reset health
    score = 0; // Reset score
    updateScore();
    gameOverMessage.style.display = 'block';
    setTimeout(() => {
        gameOverMessage.style.display = 'none';
    }, 2000); // Hide game over message after 2 seconds

    // Remove all tunnel segments
    tunnelSegments.forEach(segment => scene.remove(segment));
    tunnelSegments = [];

    // Restart the game
    addTunnelSegment();
}

animate(); // Start the animation loop
