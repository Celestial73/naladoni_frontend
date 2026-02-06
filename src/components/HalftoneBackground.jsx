import { useMemo } from 'react';

export function HalftoneBackground({ color = 'rgba(0,0,0,0.15)', spacing = 10, maxRadius = 6, minRadius = 1, rotation = 45 }) {
    // Generate dots on an oversized canvas so rotation doesn't leave gaps
    const dots = useMemo(() => {
        const canvasSize = 2000;
        const rowHeight = spacing * Math.sqrt(3) / 2;
        const cols = Math.ceil(canvasSize / spacing) + 2;
        const rows = Math.ceil(canvasSize / rowHeight) + 2;
        const cx = canvasSize / 2;
        const cy = canvasSize / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const result = [];

        for (let row = 0; row < rows; row++) {
            const offsetX = row % 2 === 1 ? spacing / 2 : 0;
            for (let col = 0; col < cols; col++) {
                const x = col * spacing + offsetX;
                const y = row * rowHeight;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const t = dist / maxDist;
                const r = minRadius + (maxRadius - minRadius) * t;
                const opacity = 0.35 + 0.5 * t;
                result.push({ x, y, r, opacity });
            }
        }
        return result;
    }, [spacing, maxRadius, minRadius]);

    return (
        <div style={{
            position: 'absolute',
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
                <g transform={`rotate(${rotation}, 200, 400)`}>
                    <g transform="translate(-800, -600)">
                        {dots.map((dot, i) => (
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
            </svg>
        </div>
    );
}
