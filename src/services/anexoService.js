/**
 * Serviço de Anexos
 * Gerencia upload, armazenamento e recuperação de anexos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AnexoService {
  constructor() {
    // Diretório para armazenamento local (pode ser substituído por S3)
    this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB padrão
  }

  /**
   * Inicializa o diretório de uploads
   */
  async inicializar() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log(`✓ Diretório de uploads criado: ${this.uploadDir}`);
    } catch (error) {
      console.error('✗ Erro ao criar diretório de uploads:', error);
    }
  }

  /**
   * Faz upload de um arquivo
   */
  async upload(dados) {
    const { transacaoId, tipo, arquivo, descricao } = dados;

    // Validações
    if (!arquivo || !arquivo.buffer) {
      throw new Error('Arquivo não fornecido');
    }

    if (arquivo.size > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Verifica se a transação existe
    const transacao = await prisma.transacao.findUnique({
      where: { id: transacaoId }
    });

    if (!transacao) {
      throw new Error('Transação não encontrada');
    }

    // Gera nome único para o arquivo
    const extensao = path.extname(arquivo.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    const nomeArquivo = `${hash}${extensao}`;

    // Define o caminho do arquivo
    const caminhoCompleto = path.join(this.uploadDir, nomeArquivo);

    try {
      // Salva o arquivo localmente
      await fs.writeFile(caminhoCompleto, arquivo.buffer);

      // Registra no banco de dados
      const anexo = await prisma.anexo.create({
        data: {
          transacaoId,
          tipo: tipo || 'OUTRO',
          nomeArquivo,
          nomeOriginal: arquivo.originalname,
          tamanho: arquivo.size,
          mimeType: arquivo.mimetype,
          url: `/uploads/${nomeArquivo}`,
          descricao
        }
      });

      console.log(`✓ Arquivo enviado: ${arquivo.originalname} -> ${nomeArquivo}`);

      return anexo;
    } catch (error) {
      // Remove o arquivo se houver erro no banco
      try {
        await fs.unlink(caminhoCompleto);
      } catch (unlinkError) {
        // Ignora erro ao deletar
      }
      throw error;
    }
  }

  /**
   * Upload para S3 (Amazon Web Services)
   */
  async uploadParaS3(dados) {
    // Exemplo de integração com AWS S3
    // Requer: npm install @aws-sdk/client-s3

    const { transacaoId, tipo, arquivo, descricao } = dados;

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Credenciais AWS não configuradas');
    }

    try {
      // Importa o cliente S3
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const bucket = process.env.AWS_S3_BUCKET;
      if (!bucket) {
        throw new Error('Bucket S3 não configurado (AWS_S3_BUCKET)');
      }

      // Gera nome único
      const extensao = path.extname(arquivo.originalname);
      const hash = crypto.randomBytes(16).toString('hex');
      const nomeArquivo = `anexos/${hash}${extensao}`;

      // Upload para S3
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: nomeArquivo,
        Body: arquivo.buffer,
        ContentType: arquivo.mimetype
      });

      await s3Client.send(command);

      // URL do arquivo no S3
      const url = `https://${bucket}.s3.amazonaws.com/${nomeArquivo}`;

      // Registra no banco
      const anexo = await prisma.anexo.create({
        data: {
          transacaoId,
          tipo: tipo || 'OUTRO',
          nomeArquivo,
          nomeOriginal: arquivo.originalname,
          tamanho: arquivo.size,
          mimeType: arquivo.mimetype,
          url,
          descricao
        }
      });

      console.log(`✓ Arquivo enviado para S3: ${arquivo.originalname}`);

      return anexo;
    } catch (error) {
      console.error('✗ Erro ao fazer upload para S3:', error);
      throw error;
    }
  }

  /**
   * Lista anexos de uma transação
   */
  async listarPorTransacao(transacaoId) {
    return await prisma.anexo.findMany({
      where: { transacaoId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Busca um anexo por ID
   */
  async buscarPorId(id) {
    return await prisma.anexo.findUnique({
      where: { id },
      include: {
        transacao: {
          include: {
            centroCusto: true,
            cliente: true
          }
        }
      }
    });
  }

  /**
   * Deleta um anexo
   */
  async deletar(id) {
    const anexo = await this.buscarPorId(id);

    if (!anexo) {
      throw new Error('Anexo não encontrado');
    }

    try {
      // Remove o arquivo do disco (se for local)
      if (!anexo.url.includes('s3.amazonaws.com')) {
        const caminhoCompleto = path.join(this.uploadDir, anexo.nomeArquivo);
        try {
          await fs.unlink(caminhoCompleto);
        } catch (error) {
          console.warn(`⚠️  Arquivo não encontrado no disco: ${caminhoCompleto}`);
        }
      } else {
        // Remove do S3
        await this.deletarDoS3(anexo.nomeArquivo);
      }

      // Remove do banco
      await prisma.anexo.delete({
        where: { id }
      });

      console.log(`✓ Anexo deletado: ${anexo.nomeOriginal}`);

      return { success: true, message: 'Anexo deletado com sucesso' };
    } catch (error) {
      console.error('✗ Erro ao deletar anexo:', error);
      throw error;
    }
  }

  /**
   * Deleta arquivo do S3
   */
  async deletarDoS3(nomeArquivo) {
    try {
      const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const bucket = process.env.AWS_S3_BUCKET;

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: nomeArquivo
      });

      await s3Client.send(command);
      console.log(`✓ Arquivo deletado do S3: ${nomeArquivo}`);
    } catch (error) {
      console.error('✗ Erro ao deletar do S3:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de armazenamento
   */
  async obterEstatisticas() {
    const total = await prisma.anexo.count();

    const porTipo = await prisma.anexo.groupBy({
      by: ['tipo'],
      _count: true,
      _sum: {
        tamanho: true
      }
    });

    const tamanhoTotal = await prisma.anexo.aggregate({
      _sum: {
        tamanho: true
      }
    });

    return {
      totalAnexos: total,
      tamanhoTotal: tamanhoTotal._sum.tamanho || 0,
      tamanhoTotalMB: ((tamanhoTotal._sum.tamanho || 0) / 1024 / 1024).toFixed(2),
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        quantidade: t._count,
        tamanho: t._sum.tamanho,
        tamanhoMB: ((t._sum.tamanho || 0) / 1024 / 1024).toFixed(2)
      }))
    };
  }

  /**
   * Valida tipo de arquivo
   */
  validarTipoArquivo(mimetype) {
    const tiposPermitidos = [
      // Imagens
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Outros
      'text/plain',
      'text/csv'
    ];

    return tiposPermitidos.includes(mimetype);
  }

  /**
   * Gera URL assinada para download seguro (S3)
   */
  async gerarUrlAssinada(id, expiracaoSegundos = 3600) {
    const anexo = await this.buscarPorId(id);

    if (!anexo) {
      throw new Error('Anexo não encontrado');
    }

    // Se for arquivo local, retorna a URL normal
    if (!anexo.url.includes('s3.amazonaws.com')) {
      return anexo.url;
    }

    try {
      const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const bucket = process.env.AWS_S3_BUCKET;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: anexo.nomeArquivo
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: expiracaoSegundos });

      return url;
    } catch (error) {
      console.error('✗ Erro ao gerar URL assinada:', error);
      throw error;
    }
  }
}

module.exports = new AnexoService();
