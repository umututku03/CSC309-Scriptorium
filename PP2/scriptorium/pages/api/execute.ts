import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code, language, stdin } = req.body as { code: string; language: string; stdin?: string };

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    // Define and create a local /tmp directory within the project
    const projectTmpDir = path.join(process.cwd(), 'tmp');
    try {
        await fs.mkdir(projectTmpDir, { recursive: true });
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    let filePath = path.join(projectTmpDir, `temp_code.${language}`);
    let className = 'TempJavaClass';
    if (language === "java") {
        filePath = path.join(projectTmpDir, `${className}.java`);
    }
    const inputPath = path.join(projectTmpDir, 'temp_input.txt');
    const outputPath = path.join(projectTmpDir, 'temp_output.txt');

    try {
        await fs.writeFile(filePath, code);
        if (stdin) {
            await fs.writeFile(inputPath, stdin);
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    let command: string;
    switch (language) {
        case 'py':
            command = stdin
                ? `python3 "${filePath}" < "${inputPath}" > "${outputPath}"`
                : `python3 "${filePath}" > "${outputPath}"`;
            break;
        case 'js':
            command = stdin
                ? `node "${filePath}" < "${inputPath}" > "${outputPath}"`
                : `node "${filePath}" > "${outputPath}"`;
            break;
        case 'c':
            command = stdin
                ? `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" < "${inputPath}" > "${outputPath}"`
                : `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" > "${outputPath}"`;
            break;
        case 'cpp':
            command = stdin
                ? `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" < "${inputPath}" > "${outputPath}"`
                : `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" > "${outputPath}"`;
            break;
        case 'java':
            command = stdin
                ? `javac "${filePath}" && java -cp "${projectTmpDir}" ${className} < "${inputPath}" > "${outputPath}"`
                : `javac "${filePath}" && java -cp "${projectTmpDir}" ${className} > "${outputPath}"`;
            break;
        default:
            return res.status(400).json({ error: 'Unsupported language' });
    }

    try {
        await new Promise<void>((resolve, reject) => {
            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    reject({ stderr, stdout });
                } else {
                    resolve();
                }
            });
        });

        const output = await fs.readFile(outputPath, 'utf-8');
        return res.status(200).json({ stdout: output });

    } catch (error) {
        return res.status(500).json(error);

    } finally {
        // Delete temporary files
        try {
            await fs.unlink(filePath);
            if (language === 'c' || language === 'cpp') {
                await fs.stat(`${filePath}.out`).then(() => fs.unlink(`${filePath}.out`)).catch(() => {});
            }
            if (language === 'java') {
                await fs.stat(path.join(projectTmpDir, `${className}.class`)).then(() => fs.unlink(path.join(projectTmpDir, `${className}.class`))).catch(() => {});
            }
            if (stdin) await fs.unlink(inputPath);
            await fs.stat(outputPath).then(() => fs.unlink(outputPath)).catch(() => {});
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }
    }
}