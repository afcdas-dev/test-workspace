// Carrega variáveis do arquivo .env (se existir) sem depender de pacotes.
// Valores já definidos no ambiente têm prioridade sobre o arquivo.
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), '.env');
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
    }
  }
}
