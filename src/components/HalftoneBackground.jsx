import { useMemo } from 'react';

export function HalftoneBackground({ 
    color = 'rgba(0,0,0,0.15)', 
    spacing = 10, 
    maxRadius = 6, 
    minRadius = 1, 
    rotation = 45,
    pattern = 'circles' // 'circles', 'lines', 'dots', 'grid', 'waves', 'diagonal', 'radial'
}) {
    const canvasSize = 2000;
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    // Helper function to calculate distance-based opacity
    const getOpacity = (x, y) => {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const t = dist / maxDist;
        return 0.35 + 0.5 * t;
    };

    // Helper function for new patterns - more transparent
    const getOpacityTransparent = (x, y) => {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const t = dist / maxDist;
        return 0.2 + 0.3 * t; // Reduced from 0.35 + 0.5 * t
    };

    // Circles pattern (original)
    const circlesPattern = useMemo(() => {
        const rowHeight = spacing * Math.sqrt(3) / 2;
        const cols = Math.ceil(canvasSize / spacing) + 2;
        const rows = Math.ceil(canvasSize / rowHeight) + 2;
        const result = [];

        for (let row = 0; row < rows; row++) {
            const offsetX = row % 2 === 1 ? spacing / 2 : 0;
            for (let col = 0; col < cols; col++) {
                const x = col * spacing + offsetX;
                const y = row * rowHeight;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const t = dist / maxDist;
                const r = minRadius + (maxRadius - minRadius) * t;
                const opacity = getOpacity(x, y);
                result.push({ x, y, r, opacity });
            }
        }
        return result;
    }, [spacing, maxRadius, minRadius]);

    // Lines pattern
    const linesPattern = useMemo(() => {
        const lineSpacing = spacing * 2;
        const numLines = Math.ceil(canvasSize / lineSpacing) + 4;
        const result = [];

        for (let i = -2; i < numLines; i++) {
            const x = i * lineSpacing;
            const dist = Math.abs(x - cx);
            const t = dist / maxDist;
            const strokeWidth = 1.5 + 2.5 * t;
            const opacity = getOpacityTransparent(x, cy);
            result.push({ x, strokeWidth, opacity });
        }
        return result;
    }, [spacing]);

    // Dots pattern (smaller, denser circles)
    const dotsPattern = useMemo(() => {
        const dotSpacing = spacing * 0.6;
        const cols = Math.ceil(canvasSize / dotSpacing) + 2;
        const rows = Math.ceil(canvasSize / dotSpacing) + 2;
        const result = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * dotSpacing;
                const y = row * dotSpacing;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const t = dist / maxDist;
                const r = minRadius * 0.4 + (maxRadius * 0.5 - minRadius * 0.4) * t;
                const opacity = getOpacityTransparent(x, y);
                result.push({ x, y, r, opacity });
            }
        }
        return result;
    }, [spacing, maxRadius, minRadius]);

    // Grid pattern
    const gridPattern = useMemo(() => {
        const gridSpacing = spacing * 3;
        const cols = Math.ceil(canvasSize / gridSpacing) + 2;
        const rows = Math.ceil(canvasSize / gridSpacing) + 2;
        const result = [];

        // Vertical lines
        for (let col = 0; col < cols; col++) {
            const x = col * gridSpacing;
            const dist = Math.abs(x - cx);
            const t = dist / maxDist;
            const strokeWidth = 1.0 + 1.5 * t;
            const opacity = getOpacityTransparent(x, cy);
            result.push({ type: 'vertical', x, strokeWidth, opacity });
        }

        // Horizontal lines
        for (let row = 0; row < rows; row++) {
            const y = row * gridSpacing;
            const dist = Math.abs(y - cy);
            const t = dist / maxDist;
            const strokeWidth = 1.0 + 1.5 * t;
            const opacity = getOpacityTransparent(cx, y);
            result.push({ type: 'horizontal', y, strokeWidth, opacity });
        }
        return result;
    }, [spacing]);

    // Waves pattern
    const wavesPattern = useMemo(() => {
        const waveSpacing = spacing * 4;
        const numWaves = Math.ceil(canvasSize / waveSpacing) + 4;
        const result = [];
        const amplitude = spacing * 2;
        const frequency = 0.01;

        for (let i = -2; i < numWaves; i++) {
            const y = i * waveSpacing;
            const dist = Math.abs(y - cy);
            const t = dist / maxDist;
            const strokeWidth = 1.5 + 2.5 * t;
            const opacity = getOpacityTransparent(cx, y);
            result.push({ y, amplitude, frequency, strokeWidth, opacity });
        }
        return result;
    }, [spacing]);

    // Diagonal lines pattern
    const diagonalPattern = useMemo(() => {
        const lineSpacing = spacing * 2.5;
        const numLines = Math.ceil(canvasSize * 1.5 / lineSpacing) + 4;
        const result = [];

        for (let i = -2; i < numLines; i++) {
            const offset = i * lineSpacing;
            const dist = Math.abs(offset);
            const t = Math.min(dist / maxDist, 1);
            const strokeWidth = 1.5 + 2.5 * t;
            const opacity = getOpacityTransparent(cx + offset, cy + offset);
            result.push({ offset, strokeWidth, opacity });
        }
        return result;
    }, [spacing]);

    // Radial/comic book pattern - lines pointing towards center
    const radialPattern = useMemo(() => {
        const numLines = 80; // Number of radial lines
        const minRadius = spacing * 2; // Inner radius where lines fade
        const maxRadius = maxDist * 1.2; // Outer radius
        const result = [];

        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Start point at edge, end point closer to center
            const startX = cx + cos * maxRadius;
            const startY = cy + sin * maxRadius;
            const endX = cx + cos * minRadius;
            const endY = cy + sin * minRadius;
            
            // Distance from center for opacity/width calculation
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const dist = Math.sqrt((midX - cx) ** 2 + (midY - cy) ** 2);
            const t = dist / maxDist;
            
            // Inverted: thicker at edges (high t), thinner at center (low t)
            // Opacity also fades towards center
            const strokeWidth = 0.3 + 2.5 * t; // Thick at edges, thin at center
            const opacity = 0.05 + 0.35 * t; // More transparent, fade towards center
            
            result.push({ 
                startX, startY, endX, endY, 
                strokeWidth, opacity 
            });
        }
        return result;
    }, [spacing]);

    // Render pattern based on selected type
    const renderPattern = () => {
        switch (pattern) {
            case 'lines':
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {linesPattern.map((line, i) => (
                                <line
                                    key={i}
                                    x1={line.x}
                                    y1={0}
                                    x2={line.x}
                                    y2={canvasSize}
                                    stroke={color}
                                    strokeWidth={line.strokeWidth}
                                    opacity={line.opacity}
                                />
                            ))}
                        </g>
                    </g>
                );

            case 'dots':
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {dotsPattern.map((dot, i) => (
                                <circle
                                    key={i}
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.r}
                                    fill={color}
                                    opacity={dot.opacity}
                                />
                            ))}
                        </g>
                    </g>
                );

            case 'grid':
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {gridPattern.map((line, i) => (
                                line.type === 'vertical' ? (
                                    <line
                                        key={`v-${i}`}
                                        x1={line.x}
                                        y1={0}
                                        x2={line.x}
                                        y2={canvasSize}
                                        stroke={color}
                                        strokeWidth={line.strokeWidth}
                                        opacity={line.opacity}
                                    />
                                ) : (
                                    <line
                                        key={`h-${i}`}
                                        x1={0}
                                        y1={line.y}
                                        x2={canvasSize}
                                        y2={line.y}
                                        stroke={color}
                                        strokeWidth={line.strokeWidth}
                                        opacity={line.opacity}
                                    />
                                )
                            ))}
                        </g>
                    </g>
                );

            case 'waves':
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {wavesPattern.map((wave, i) => {
                                const points = [];
                                const numPoints = 200;
                                for (let p = 0; p <= numPoints; p++) {
                                    const x = (p / numPoints) * canvasSize;
                                    const y = wave.y + Math.sin(x * wave.frequency) * wave.amplitude;
                                    points.push(`${x},${y}`);
                                }
                                return (
                                    <polyline
                                        key={i}
                                        points={points.join(' ')}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={wave.strokeWidth}
                                        opacity={wave.opacity}
                                    />
                                );
                            })}
                        </g>
                    </g>
                );

            case 'diagonal':
                return (
                    <g transform={`rotate(${rotation + 45}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {diagonalPattern.map((line, i) => (
                                <line
                                    key={i}
                                    x1={-canvasSize}
                                    y1={-canvasSize + line.offset}
                                    x2={canvasSize * 2}
                                    y2={canvasSize * 2 + line.offset}
                                    stroke={color}
                                    strokeWidth={line.strokeWidth}
                                    opacity={line.opacity}
                                />
                            ))}
                        </g>
                    </g>
                );

            case 'radial':
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {radialPattern.map((line, i) => (
                                <line
                                    key={i}
                                    x1={line.startX}
                                    y1={line.startY}
                                    x2={line.endX}
                                    y2={line.endY}
                                    stroke={color}
                                    strokeWidth={line.strokeWidth}
                                    opacity={line.opacity}
                                    strokeLinecap="round"
                                />
                            ))}
                        </g>
                    </g>
                );

            case 'circles':
            default:
                return (
                    <g transform={`rotate(${rotation}, 200, 400)`}>
                        <g transform="translate(-800, -600)">
                            {circlesPattern.map((dot, i) => (
                                <circle
                                    key={i}
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.r}
                                    fill={color}
                                    opacity={dot.opacity}
                                />
                            ))}
                        </g>
                    </g>
                );
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
        }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 800"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                {renderPattern()}
            </svg>
        </div>
    );
}
