import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __filename and __dirname equivalents for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '..', 'src', 'icons');

/**
 * Modifies an icon file to accept 'size' and 'color' props.
 * @param {string} filePath - The path to the icon file.
 */
const modifyIcon = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Modify component props to include size and color
    const propsRegex = /React\.SVGProps<SVGSVGElement>/;
    if (propsRegex.test(content)) {
        content = content.replace(
            propsRegex,
            '(props: React.SVGProps<SVGSVGElement> & { size?: string | number; color?: string })'
        );
    } else {
        const defaultPropsRegex = /(props: any)/;
        if (defaultPropsRegex.test(content)) {
            content = content.replace(
                defaultPropsRegex,
                '(props: React.SVGProps<SVGSVGElement> & { size?: string | number; color?: string })'
            );
        }
    }

    // 2. Modify the <svg> tag for size props and remove existing fill
    const svgTagRegex = /<svg([^>]*)>/;
    const svgMatch = content.match(svgTagRegex);

    if (svgMatch) {
        let svgAttributes = svgMatch[1];

        // Remove existing width, height, and fill attributes
        svgAttributes = svgAttributes
            .replace(/width="[^"]*"/, '')
            .replace(/height="[^"]*"/, '')
            .replace(/fill="[^"]*"/, '');

        const sizeAttributes = ` {...(props.size ? { width: props.size, height: props.size } : { width: "1em", height: "1em" })}`;

        // Replace <svg ...> tag with dynamic props
        content = content.replace(svgTagRegex, `<svg${svgAttributes}${sizeAttributes}>`);
    }

    // 3. Modify all elements to dynamically use stroke and fill
    // content = content.replace(/<([a-z]+)([^>]*)>/g, (match, tagName, attributes) => {
    //     let newAttributes = attributes;
    //
    //     // Stroke
    //     if (/stroke="[^"]*"/.test(newAttributes)) {
    //         newAttributes = newAttributes.replace(/stroke="[^"]*"/, 'stroke={props.color || "currentColor"}');
    //     } else {
    //         newAttributes += ' stroke={props.color || "currentColor"}';
    //     }
    //
    //     // Fill
    //     if (/fill="[^"]*"/.test(newAttributes)) {
    //         newAttributes = newAttributes.replace(/fill="[^"]*"/, 'fill={props.color || "currentColor"}');
    //     } else {
    //         newAttributes += ' fill={props.color || "currentColor"}';
    //     }
    //
    //     return `<${tagName}${newAttributes}>`;
    // });

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
