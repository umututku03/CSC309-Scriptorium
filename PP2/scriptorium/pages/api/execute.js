import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // To generate unique container names

// Language configurations
const LANGUAGE_CONFIG = {
  py: { ext: 'py', image: 'python-executor' },
  js: { ext: 'js', image: 'js-executor' },
  c: { ext: 'c', image: 'c-executor' },
  cpp: { ext: 'cpp', image: 'cpp-executor' },
  java: {
    ext: 'java',
    image: 'java-executor',
    fileName: 'Main.java',
    template: (code) => `
public class Main {
  public static void main(String[] args) {
    ${code}
  }
}`,
  },
  go: { ext: 'go', image: 'go-executor' },
  rs: { ext: 'rs', image: 'rs-executor' },
  rb: { ext: 'rb', image: 'rb-executor' },
  php: { ext: 'php', image: 'php-executor' },
  swift: { ext: 'swift', image: 'swift-executor' },
  pl: { ext: 'pl', image: 'pl-executor' },
  r: { ext: 'r', image: 'r-executor' },
};

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, language, stdin } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return res.status(422).json({ error: 'Unsupported language' });
  }

  const projectTmpDir = path.join(process.cwd(), 'tmp');
  console.log('Temporary directory path:', projectTmpDir);

  try {
    // Create tmp directory if it doesn't exist
    await fs.mkdir(projectTmpDir, { recursive: true });
    console.log('Temporary directory created successfully');

    // Set directory permissions
    await fs.chmod(projectTmpDir, 0o777);
  } catch (err) {
    console.error('Failed to create/modify tmp directory:', err);
    return res.status(500).json({ error: 'Failed to create temporary directory' });
  }

  const fileName = langConfig.fileName || `code.${langConfig.ext}`;
  const filePath = path.join(projectTmpDir, fileName);
  const containerName = `executor-${uuidv4()}`; // Generate a unique container name

  try {
    // Write code to file
    const finalCode = language === 'java' && !code.includes('class')
      ? langConfig.template(code)
      : code;

    await fs.writeFile(filePath, finalCode);
    console.log('Code file written:', filePath);
  } catch (err) {
    console.error('Failed to write code file:', err);
    return res.status(500).json({ error: 'Failed to write code file' });
  }

  // Build Docker command with a named container and resource constraints
  const dockerCommand = stdin
    ? `echo ${JSON.stringify(stdin)} | docker run --rm --name ${containerName} -i -v "${projectTmpDir}:/sandbox" ${langConfig.image} /sandbox/${fileName}`
    : `docker run --rm --name ${containerName} -v "${projectTmpDir}:/sandbox" ${langConfig.image} /sandbox/${fileName}`;

  console.log('Executing Docker command:', dockerCommand);

  try {
    const output = await new Promise((resolve, reject) => {
      const process = exec(dockerCommand, { timeout: 10000 }, (error, stdout, stderr) => {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);

        if (error) {
          console.error('Docker execution error:', {
            message: error.message,
            code: error.code,
            signal: error.signal,
          });

          // Handle timeout specifically
          if (error.signal === 'SIGTERM') {
            return reject({ type: 'timeout', message: 'Execution timed out. Your code may contain an infinite loop or take too long to complete.' });
          }

          // General execution error
          return reject({ type: 'execution_error', message: stderr || error.message });
        }

        resolve({ stdout, stderr });
      });

      // Add a timeout to forcefully stop the container
      const timeout = setTimeout(() => {
        console.log(`Timeout reached. Stopping container: ${containerName}`);
        exec(`docker kill ${containerName}`);
        reject({ type: 'timeout', message: 'Execution timed out. The container was forcefully terminated.' });
      }, 10000);

      process.on('close', () => clearTimeout(timeout)); // Clear timeout on process completion
    });

    return res.status(200).json({
      stdout: output.stdout,
      stderr: output.stderr,
      status: 'success',
    });
  } catch (error) {
    console.error('Execution failed:', error);

    if (error.type === 'timeout') {
      // Clean up the container after timeout
      exec(`docker rm -f ${containerName}`, (cleanupError) => {
        if (cleanupError) {
          console.error('Failed to remove container:', cleanupError);
        } else {
          console.log(`Container ${containerName} removed after timeout.`);
        }
      });
      return res.status(422).json({ error: error.message });
    }

    return res.status(422).json({
      error: error.message || 'Execution failed',
    });
  } finally {
    // Cleanup temporary file
    try {
      await fs.unlink(filePath);
      console.log('Temporary file deleted:', filePath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Clean up the container explicitly
    exec(`docker rm -f ${containerName}`, (cleanupError) => {
      if (cleanupError) {
        console.error('Failed to remove container:', cleanupError);
      } else {
        console.log(`Container ${containerName} removed successfully.`);
      }
    });
  }
}