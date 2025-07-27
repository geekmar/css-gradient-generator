class GradientGenerator {
    constructor() {
        this.colorStops = [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 100 }
        ];
        
        this.initElements();
        this.initEventListeners();
        this.updatePreview();
    }
    
    initElements() {
        this.gradientType = document.getElementById('gradientType');
        this.color1 = document.getElementById('color1');
        this.color2 = document.getElementById('color2');
        this.angle = document.getElementById('angle');
        this.angleValue = document.getElementById('angleValue');
        this.radialShape = document.getElementById('radialShape');
        this.radialSize = document.getElementById('radialSize');
        this.conicAngle = document.getElementById('conicAngle');
        this.conicAngleValue = document.getElementById('conicAngleValue');
        this.addColorBtn = document.getElementById('addColor');
        this.exportCSSBtn = document.getElementById('exportCSS');
        this.copyCSSBtn = document.getElementById('copyCSS');
        this.preview = document.getElementById('preview');
        this.cssCode = document.getElementById('cssCode');
        this.linearControls = document.querySelector('.linear-controls');
        this.radialControls = document.querySelector('.radial-controls');
        this.conicControls = document.querySelector('.conic-controls');
        this.additionalColors = document.getElementById('additionalColors');
    }
    
    initEventListeners() {
        // Gradient type change
        this.gradientType.addEventListener('change', () => {
            this.toggleControls();
            this.updatePreview();
        });
        
        // Color changes
        this.color1.addEventListener('input', () => {
            this.colorStops[0].color = this.color1.value;
            this.updatePreview();
        });
        
        this.color2.addEventListener('input', () => {
            this.colorStops[1].color = this.color2.value;
            this.updatePreview();
        });
        
        // Angle changes
        this.angle.addEventListener('input', () => {
            this.angleValue.textContent = `${this.angle.value}°`;
            this.updatePreview();
        });
        
        this.conicAngle.addEventListener('input', () => {
            this.conicAngleValue.textContent = `${this.conicAngle.value}°`;
            this.updatePreview();
        });
        
        // Radial controls
        this.radialShape.addEventListener('change', () => this.updatePreview());
        this.radialSize.addEventListener('change', () => this.updatePreview());
        
        // Add color stop
        this.addColorBtn.addEventListener('click', () => this.addColorStop());
        
        // Export CSS
        this.exportCSSBtn.addEventListener('click', () => this.exportCSS());
        
        // Copy CSS
        this.copyCSSBtn.addEventListener('click', () => this.copyCSS());
    }
    
    toggleControls() {
        const type = this.gradientType.value;
        
        // Hide all controls first
        this.linearControls.classList.add('hidden');
        this.radialControls.classList.add('hidden');
        this.conicControls.classList.add('hidden');
        
        // Show relevant controls
        switch(type) {
            case 'linear':
                this.linearControls.classList.remove('hidden');
                break;
            case 'radial':
                this.radialControls.classList.remove('hidden');
                break;
            case 'conic':
                this.conicControls.classList.remove('hidden');
                break;
        }
    }
    
    addColorStop() {
        const newColor = {
            color: '#00ff00',
            position: 50
        };
        
        this.colorStops.push(newColor);
        this.renderColorStops();
        this.updatePreview();
    }
    
    renderColorStops() {
        // Clear existing additional color stops
        this.additionalColors.innerHTML = '';
        
        // Add color stops (skip first two as they're handled separately)
        for (let i = 2; i < this.colorStops.length; i++) {
            const colorStop = this.colorStops[i];
            const colorStopElement = document.createElement('div');
            colorStopElement.className = 'color-stop';
            colorStopElement.innerHTML = `
                <input type="color" value="${colorStop.color}" data-index="${i}">
                <input type="range" min="0" max="100" value="${colorStop.position}" data-index="${i}">
                <span>${colorStop.position}%</span>
                <button class="remove-color" data-index="${i}">-</button>
            `;
            
            this.additionalColors.appendChild(colorStopElement);
        }
        
        // Add event listeners for the new color stops
        this.additionalColors.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.colorStops[index].color = e.target.value;
                this.updatePreview();
            });
        });
        
        this.additionalColors.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.colorStops[index].position = parseInt(e.target.value);
                e.target.nextElementSibling.textContent = `${e.target.value}%`;
                this.updatePreview();
            });
        });
        
        this.additionalColors.querySelectorAll('.remove-color').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.colorStops.splice(index, 1);
                this.renderColorStops();
                this.updatePreview();
            });
        });
    }
    
    generateGradientCSS() {
        const type = this.gradientType.value;
        let gradientCSS = '';
        
        // Sort color stops by position
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        
        // Create color stop string
        const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        
        switch(type) {
            case 'linear':
                gradientCSS = `linear-gradient(${this.angle.value}deg, ${colorStops})`;
                break;
            case 'radial':
                gradientCSS = `radial-gradient(${this.radialShape.value} ${this.radialSize.value}, ${colorStops})`;
                break;
            case 'conic':
                gradientCSS = `conic-gradient(from ${this.conicAngle.value}deg, ${colorStops})`;
                break;
        }
        
        return gradientCSS;
    }
    
    updatePreview() {
        const gradientCSS = this.generateGradientCSS();
        this.preview.style.background = gradientCSS;
        this.cssCode.textContent = `background: ${gradientCSS};`;
    }
    
    exportCSS() {
        const gradientCSS = this.generateGradientCSS();
        const cssText = `background: ${gradientCSS};`;
        
        // Create a blob and download link
        const blob = new Blob([cssText], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradient.css';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    copyCSS() {
        const cssText = this.cssCode.textContent;
        
        navigator.clipboard.writeText(cssText).then(() => {
            // Show feedback
            const originalText = this.copyCSSBtn.textContent;
            this.copyCSSBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                this.copyCSSBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy CSS: ', err);
        });
    }
}

// Initialize the gradient generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GradientGenerator();
});