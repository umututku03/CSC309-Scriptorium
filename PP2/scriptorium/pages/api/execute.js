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
    return res.status(500).json({ error: 'Failed to create tmp directory' });
  }

  // Map language to file extension
  const extensions = {
    py: 'py',
    js: 'js',
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    go: 'go',
    rs: 'rs',
    rb: 'rb',
    php: 'php',
    swift: 'swift',
    pl: 'pl',
    sh: 'sh',
    ts: 'ts',
    r: 'r',
  };

  const extension = extensions[language];
  if (!extension) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const fileName = language === 'java' ? 'TempJavaClass.java' : `temp_code.${extension}`;
  const filePath = path.join(projectTmpDir, fileName);
  const inputPath = path.join(projectTmpDir, 'temp_input.txt');

  try {
    await fs.writeFile(filePath, code);
    if (stdin) {
      await fs.writeFile(inputPath, stdin);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write code or input files' });
  }

  // Map language to Docker image
  const dockerImages = {
    py: 'sandbox_python',
    js: 'sandbox_js',
    c: 'sandbox_c',
    cpp: 'sandbox_cpp',
    java: 'sandbox_java',
    go: 'sandbox_go',
    rs: 'sandbox_rs',
    rb: 'sandbox_rb',
    php: 'sandbox_php',
    swift: 'sandbox_swift',
    pl: 'sandbox_pl',
    sh: 'sandbox_sh',
    ts: 'sandbox_ts',
    r: 'sandbox_r',
  };

  const dockerImage = dockerImages[language];
  if (!dockerImage) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  // Build Docker command
  const dockerCommand = [
    'docker run --rm',
    `-v ${projectTmpDir}:/sandbox`, // Mount tmp directory to /sandbox in the container
    dockerImage,
    language === 'java' ? 'TempJavaClass' : `temp_code.${extension}`, // Pass the file name
  ];

  console.log(`Executing Docker command: ${dockerCommand.join(' ')}`);

  try {
    const output = await new Promise((resolve, reject) => {
      exec(dockerCommand.join(' '), { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || 'Execution failed');
        } else {
          resolve(stdout);
        }
      });
    });

    return res.status(200).json({ stdout: output });

  } catch (error) {
    return res.status(500).json({ error });

  } finally {
    // Cleanup temporary files
    try {
      await fs.unlink(filePath);
      if (stdin) await fs.unlink(inputPath);
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}