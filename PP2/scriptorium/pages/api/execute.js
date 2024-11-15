// pages/api/execute.js
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, language, stdin } = req.body;

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
  if (language === "java") {
    var className = 'TempJavaClass';
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

  let command;
  switch (language) {
    case 'py':
      if (stdin){
        command = `python3 "${filePath}" < "${inputPath}" > "${outputPath}"`;
      }
      else {
        command = `python3 "${filePath}" > "${outputPath}"`;
      }
      break;
    case 'js':
      if (stdin) {
        command = `node "${filePath}" < "${inputPath}" > "${outputPath}"`;
      }
      else {
        command = `node "${filePath}" > "${outputPath}"`;
      }
      break;
    case 'c':
      if (stdin) {
        command = `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" < "${inputPath}" > "${outputPath}"`;
      }
      else {
        command = `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" > "${outputPath}"`;
      }
      break;
    case 'cpp':
      if (stdin) {
        command = `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" < "${inputPath}" > "${outputPath}"`;
      }
      else {
        command = `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" > "${outputPath}"`;
      }
      break;
    case 'java':
      if (stdin) {
        command = `javac "${filePath}" && java -cp "${projectTmpDir}" ${className} < "${inputPath}" > "${outputPath}"`;
      } else {
        command = `javac "${filePath}" && java -cp "${projectTmpDir}" ${className} > "${outputPath}"`;
      }
      break;
    default:
      return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    await new Promise((resolve, reject) => {
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject({stderr, stdout});
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