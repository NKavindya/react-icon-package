import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __filename and __dirname equivalents for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '..', 'src', 'icons');

/**
 * Modifies an icon file to accept various styling props.
 * @param {string} filePath - The path to the icon file.
 */
const modifyIcon = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Modify component props to include size, color, fill, stroke, width, height, disabled, background
    const propsType = `React.SVGProps<SVGSVGElement> & {
        size?: string | number;
        color?: string;
        fill?: string;
        stroke?: string;
        width?: string | number;
        height?: string | number;
        strokeWidth?: string | number;
        disabled?: boolean;
        backgroundColor?: string;
        backgroundShape?: 'circle' | 'rect';
        backgroundPadding?: number;
    }`;

    const propsRegex = /React\.SVGProps<SVGSVGElement>/;
    if (propsRegex.test(content)) {
        content = content.replace(propsRegex, `(${propsType})`);
    } else {
        const defaultPropsRegex = /(props: any)/;
        if (defaultPropsRegex.test(content)) {
            content = content.replace(defaultPropsRegex, `(props: ${propsType})`);
        }
    }

    // 2. Modify the <svg> tag for dynamic props and remove existing styling attributes
    const svgTagRegex = /<svg([^>]*)>/;
    const svgMatch = content.match(svgTagRegex);

    if (svgMatch) {
        let svgAttributes = svgMatch[1];

        // Remove existing width, height, fill, stroke, and stroke-width attributes
        svgAttributes = svgAttributes
            .replace(/width="[^"]*"/g, '')
            .replace(/height="[^"]*"/g, '')
            .replace(/fill="[^"]*"/g, '')
            .replace(/stroke="[^"]*"/g, '')
            .replace(/stroke-width="[^"]*"/g, '');

        // Construct the string representations of the dynamic JSX attributes
        const dynamicWidthAttr = `width={props.width || props.size || "1em"}`;
        const dynamicHeightAttr = `height={props.height || props.size || "1em"}`;
        const dynamicFillAttr = `fill={props.disabled ? "#585858" : (props.fill || props.color || "currentColor")}`;
        const dynamicStrokeAttr = `stroke={props.disabled ? "#585858" : (props.stroke || props.color || "currentColor")}`;
        const dynamicStrokeWidthAttr = `strokeWidth={props.strokeWidth}`;
        const dynamicStyleAttr = `style={{ ...props.style, ...(props.disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}) }}`;


        const newSvgAttributes = `
            ${svgAttributes}
            ${dynamicWidthAttr}
            ${dynamicHeightAttr}
            ${dynamicFillAttr}
            ${dynamicStrokeAttr}
            ${dynamicStrokeWidthAttr}
            ${dynamicStyleAttr}
        `;

        // Replace <svg ...> tag with dynamic props
        content = content.replace(svgTagRegex, `<svg${newSvgAttributes}>`);
    }

    // 3. Modify all inner SVG elements (path, circle, rect, etc.)
    // Remove any hardcoded fill, stroke, stroke-width attributes from inner elements
    // This allows them to inherit from the parent <svg> element, which is now dynamically controlled.
    // We explicitly keep `fill="none"` or `stroke="none"` if they exist, as these are intentional.
    content = content.replace(/<(path|circle|rect|line|polygon|polyline|g)([^>]*)>/g, (match, tagName, attributes) => {
        let newAttributes = attributes;

        // Function to remove an attribute unless its value is "none"
        const removeUnlessNone = (attrName, currentAttributes) => {
            const regex = new RegExp(`${attrName}="([^"]*)"`, 'g');
            let match;
            let result = currentAttributes;
            while ((match = regex.exec(currentAttributes)) !== null) {
                if (match[1].toLowerCase() !== 'none') {
                    result = result.replace(match[0], '');
                }
            }
            return result;
        };

        newAttributes = removeUnlessNone('fill', newAttributes);
        newAttributes = removeUnlessNone('stroke', newAttributes);
        newAttributes = newAttributes.replace(/stroke-width="[^"]*"/g, ''); // Always remove stroke-width from inner elements

        // Also remove fill/stroke from inline style objects if present (this is a best-effort regex)
        newAttributes = newAttributes.replace(/style=\{\{([^}]*)\}\}/g, (styleMatch, styleContent) => {
            let newStyleContent = styleContent;
            newStyleContent = newStyleContent.replace(/fill:\s*['"]?[^'"]+['"]?,?/g, '');
            newStyleContent = newStyleContent.replace(/stroke:\s*['"]?[^'"]+['"]?,?/g, '');
            newStyleContent = newStyleContent.replace(/strokeWidth:\s*['"]?[^'"]+['"]?,?/g, '');
            // Clean up empty style objects or trailing commas
            newStyleContent = newStyleContent.trim().replace(/,\s*$/, '');
            return newStyleContent ? `style={{${newStyleContent}}}` : '';
        });

        return `<${tagName}${newAttributes}>`;
    });

    // 4. Inject background shape conditionally as the first child of <svg>
    const svgContentRegex = /(<svg[^>]*>)([\s\S]*?)(<\/svg>)/;
    content = content.replace(svgContentRegex, (match, openTag, innerContent, closeTag) => {
        const backgroundShapeJSX = `
            {props.backgroundColor && props.backgroundShape === 'rect' && (
                <rect
                    x={props.backgroundPadding || 0}
                    y={props.backgroundPadding || 0}
                    width="100%"
                    height="100%"
                    rx="4"
                    fill={props.backgroundColor}
                />
            )}
            {props.backgroundColor && props.backgroundShape === 'circle' && (
                <circle
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fill={props.backgroundColor}
                />
            )}
        `;
        return `${openTag}\n${backgroundShapeJSX}\n${innerContent}\n${closeTag}`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
};

const main = () => {
    fs.readdir(ICONS_DIR, (err, files) => {
        if (err) {
            console.error('Error reading icons directory:', err);
            process.exit(1);
        }

        files.forEach((file) => {
            const filePath = path.join(ICONS_DIR, file);
            if (path.extname(file) === '.js' || path.extname(file) === '.jsx') {
                try {
                    modifyIcon(filePath);
                    console.log(`Modified: ${file}`);
                } catch (error) {
                    console.error(`Error modifying ${file}:`, error);
                }
            }
        });
    });
};

main();
