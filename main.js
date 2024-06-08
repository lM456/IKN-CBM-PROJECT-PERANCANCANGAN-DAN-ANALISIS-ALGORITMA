class Node {
    constructor(x, y, width, height, level) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.level = level;
        this.roadWidth = 1; 
        this.children = [];
        this.updateCorners();
    }
    static isBigBuildingPlaced = false;
    static isGardenPlaced = false; 
    updateCorners() {
        this.topLeft = [this.x, this.y];
        this.topRight = [this.x + this.width, this.y];
        this.bottomRight = [this.x + this.width, this.y + this.height];
        this.bottomLeft = [this.x, this.y + this.height];
    }

    drawBorder() {
        const offset = this.roadWidth / 2;
        this.drawLine(this.x - offset, this.y - offset, this.x + this.width + offset, this.y - offset, this.roadWidth, 'gray');
        this.drawLine(this.x - offset, this.y + this.height + offset, this.x + this.width + offset, this.y + this.height + offset, this.roadWidth, 'gray');
        this.drawLine(this.x - offset, this.y - offset, this.x - offset, this.y + this.height + offset, this.roadWidth, 'gray');
        this.drawLine(this.x + this.width + offset, this.y - offset, this.x + this.width + offset, this.y + this.height + offset, this.roadWidth, 'gray');
    }

    drawLine(x1, y1, x2, y2, lineWidth, strokeStyle) {
        context.lineWidth = lineWidth * 10; 
        context.strokeStyle = strokeStyle;
        context.beginPath();
        context.moveTo(x1 * 10, y1 * 10); 
        context.lineTo(x2 * 10, y2 * 10);  
        context.stroke();
    }

    drawIntersections() {
        const offset = this.roadWidth / 2; 
       
        this.drawCircle(this.x - offset, this.y - offset, this.roadWidth / 2, 'gray');
        this.drawCircle(this.x + this.width + offset, this.y - offset, this.roadWidth / 2, 'gray');
        this.drawCircle(this.x - offset, this.y + this.height + offset, this.roadWidth / 2, 'gray');
        this.drawCircle(this.x + this.width + offset, this.y + this.height + offset, this.roadWidth / 2, 'gray');
    }

    drawCircle(x, y, radius, fillStyle) {
        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x * 10, y * 10, radius * 10, 0, 2 * Math.PI *2);  
        context.fill();
    }

    drawInsideRect() {
        context.fillStyle = 'lightgreen'; 
        context.fillRect(this.x * 10, this.y * 10, this.width * 10, this.height * 10);

        this.drawBins();
        this.placeBuildings();
    }

    drawBins() {
     
    }

    placeBuildings() {
        const binPositions = this.generateBinPositions();
        let bigBuildingPlaced = false;
        let mediumBuildingsToPlace = 1; 
        let smallBuildingsToPlace = 1; 
        let housesToPlace = 1; 
        let treesToPlace = 1; 
        let carToPlace = 1; 
       
        let gardensToPlace = Node.isGardenPlaced ? 0 : 1; 
    
        binPositions.forEach(posX => {
            let posY = this.topLeft[1];
            while (posY < this.bottomLeft[1]) {
                let building;
    
                if (!bigBuildingPlaced) {
                    building = bigBuilding;
                    bigBuildingPlaced = true;
                } else if (mediumBuildingsToPlace > 0) {
                    building = mediumBuilding;
                    mediumBuildingsToPlace--;
                } else if (smallBuildingsToPlace > 0) {
                    building = smallBuilding;
                    smallBuildingsToPlace--;
                } else if (housesToPlace > 0) {
                    building = house;
                    housesToPlace--;
                } else if (treesToPlace > 0) {
                    building = tree;
                    treesToPlace--;
                } else if (carToPlace > 0) {
                    building = car;
                    carToPlace--;
                } else if (gardensToPlace > 0) {
                    building = garden;
                    gardensToPlace--;
                    Node.isGardenPlaced = true; 
                } else {
                    break;
                }
    
                let randomPosX = this.snapToGrid(Math.floor(Math.random() * (this.topRight[0] - building.width - this.x)) + this.x);
                let randomPosY = this.snapToGrid(Math.floor(Math.random() * (this.bottomLeft[1] - building.height - this.y)) + this.y);
    
                
                let overlap = false;
                for (let i = 0; i < this.children.length; i++) {
                    const child = this.children[i];
                    if (randomPosX < child.x + child.width &&
                        randomPosX + building.width > child.x &&
                        randomPosY < child.y + child.height &&
                        randomPosY + building.height > child.y) {
                        overlap = true;
                        break;
                    }
                }
    
                if (!overlap && randomPosY + building.height <= this.bottomLeft[1] && randomPosX + building.width <= this.topRight[0]) {
                    building.draw(randomPosX, randomPosY);
                    posY += building.height;
                } else {
                    // Cari posisi baru
                    randomPosX = this.snapToGrid(Math.floor(Math.random() * (this.topRight[0] - building.width - this.x)) + this.x);
                    randomPosY = this.snapToGrid(Math.floor(Math.random() * (this.bottomLeft[1] - building.height - this.y)) + this.y);
                }
            }
        });
    }

    snapToGrid(value) {
        return Math.round(value / 2) * 2; 
    }
    
    generateBinPositions() {
        let binPosX = this.topLeft[0];
        const binPositions = [];
        while (binPosX < this.topRight[0]) {
            binPositions.push(binPosX);
            binPosX += 8; 
        }
        return binPositions;
    }

    splitRandomly() {
        const orientation = Math.random() > 0.5;
        const partition = this.generatePartitionPoint(orientation);
        if (partition === null) return;

        if (orientation) {
            const leftWidth = partition - this.x;
            const rightWidth = this.width - leftWidth;
            this.children.push(new Node(this.x, this.y, leftWidth, this.height, this.level + 1));
            this.children.push(new Node(partition, this.y, rightWidth, this.height, this.level + 1));
        } else {
            const topHeight = partition - this.y;
            const bottomHeight = this.height - topHeight;
            this.children.push(new Node(this.x, this.y, this.width, topHeight, this.level + 1));
            this.children.push(new Node(this.x, partition, this.width, bottomHeight, this.level + 1));
        }
        
    }

    generatePartitionPoint(orientation) {
        if (orientation) {
            const partition = this.level === 0 ? this.x + this.width / 2 : this.randomBetween(this.x, this.x + this.width);
            if (partition - this.x < MIN_SIZE || this.x + this.width - partition < MIN_SIZE) return null;
            return partition;
        } else {
            const partition = this.level === 0 ? this.y + this.height / 2 : this.randomBetween(this.y, this.y + this.height);
            if (partition - this.y < MIN_SIZE || this.y + this.height - partition < MIN_SIZE) return null;
            return partition;
        }
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class BSPTree {
    constructor(root) {
        this.root = root;
    }



    expand() {
        const queue = [this.root];
        while (queue.length) {
            const node = queue.shift();
            node.splitRandomly();
            if (node.children.length) queue.push(...node.children);
        }
    }

    getLeaves() {
        const leaves = [];
        const queue = [this.root];
        while (queue.length) {
            const node = queue.shift();
            if (node.children.length) {
                queue.push(...node.children);
            } else {
                leaves.push(node);
            }
        }
        return leaves;
    }
}

const bigBuilding = {
    width: 10,
    height: 5,
    images: [
        document.getElementById("Bangunan_besar1")
    ],
    draw(x, y) {
        const img = this.images[0]; 
        context.drawImage(img, x * 10, y * 10, this.width * 10, this.height * 10);
    }
}

const mediumBuilding = {
    width: 5,
    height: 3,
    images: [
        document.getElementById("Bangunan_sedang1"),
        document.getElementById("Bangunan_sedang2"),
        document.getElementById("Bangunan_sedang3")
    ],
    draw(x, y) {
        const img = this.images[Math.floor(Math.random() * this.images.length)];
        context.drawImage(img, x * 10, y * 10, this.width * 10, this.height * 10);
    }
};

const smallBuilding = {
    width: 2,  
    height: 2,
    images: [
        document.getElementById("Bangunan_kecil1"),
        document.getElementById("Bangunan_kecil2"),
        document.getElementById("Bangunan_kecil3"),
        document.getElementById("Bangunan_kecil4"),
        document.getElementById("Bangunan_kecil5"),
        document.getElementById("Bangunan_kecil6"),
        document.getElementById("Bangunan_kecil7"),
        document.getElementById("Bangunan_kecil8"),
        document.getElementById("Bangunan_kecil9"),
        document.getElementById("Bangunan_kecil10")
        
    ],
    draw(x, y) {
        const img = this.images[Math.floor(Math.random() * this.images.length)];
        context.drawImage(img, x * 10, y * 10, this.width * 10, this.height * 10);  
    }
};

const house = {
    width: 1,  
    height: 2,
    images: [
        document.getElementById("rumah1"),
        document.getElementById("rumah2"),
        document.getElementById("rumah3"),
        document.getElementById("rumah4"),
        document.getElementById("rumah5"),
        document.getElementById("rumah6"),
        document.getElementById("rumah7"),
        document.getElementById("rumah8"),
        document.getElementById("rumah9"),
        document.getElementById("rumah10")
        
    ],
    draw(x, y) {
        const img = this.images[Math.floor(Math.random() * this.images.length)];
        context.drawImage(img, x * 10, y * 10, this.width * 10, this.height * 10); 
    }
};

const tree = {
    width: 3,
    height: 3,
    image: document.getElementById("pohon"),
    draw(x, y) {
        context.drawImage(this.image, x * 10, y * 10, this.width * 10, this.height * 10);
    }
};

const car = {
    width: 2,
    height: 1,
    image: document.getElementById("Mobil"),
    draw(x, y) {
        context.drawImage(this.image, x * 10, y * 10, this.width * 10, this.height * 10);
    }
};

const garden = {
    width: 10,  
    height: 8,
    image: document.getElementById("Taman"),
    draw(x, y) {
        context.drawImage(this.image, x * 10, y * 10, this.width * 10, this.height * 10);  
    }
};


const canvas = document.getElementById("thecanvas");
const context = canvas.getContext('2d');
canvas.width = 1500;  
canvas.height = 1500;  
const MIN_SIZE = 5;  

function createMap() {
    context.clearRect(0, 0, canvas.width, canvas.height);  
    const root = new Node(0, 0, 150, 150, 0);  
    root.drawBorder();
    root.drawIntersections();

    const tree = new BSPTree(root);
    tree.expand();
    const leaves = tree.getLeaves();

    leaves.forEach(leaf => {
        leaf.drawBorder();
        leaf.drawIntersections();
        leaf.drawInsideRect();
    });

}

document.getElementById("redesignButton").addEventListener("click", createMap); 


createMap();

