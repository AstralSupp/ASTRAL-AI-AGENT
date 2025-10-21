import axios from 'axios';
import databaseService from './database.service';
import claudeService from './claude.service';
import logger from '../utils/logger';

class ChatwootKnowledgeLoaderService {
  private chatwootDocsUrl = 'https://www.chatwoot.com/docs';

  async loadChatwootKnowledge() {
    try {
      logger.info('Loading Chatwoot knowledge...');

      // This is a comprehensive overview of Chatwoot features
      const chatwootKnowledge = this.getChatwootKnowledgeBase();

      // Store in database
      for (const item of chatwootKnowledge) {
        await databaseService.upsertChatwootKnowledge(item);
      }

      // Update Claude's system prompt with knowledge
      const knowledgeText = chatwootKnowledge
        .map((item) => `## ${item.title}\n${item.content}`)
        .join('\n\n');

      claudeService.updateSystemPrompt(knowledgeText);

      logger.info('Chatwoot knowledge loaded successfully', {
        itemCount: chatwootKnowledge.length,
      });

      return chatwootKnowledge;
    } catch (error) {
      logger.error('Error loading Chatwoot knowledge:', error);
      throw error;
    }
  }

  private getChatwootKnowledgeBase() {
    return [
      {
        title: 'O que é Chatwoot',
        content: `Chatwoot é uma plataforma de atendimento ao cliente de código aberto (open source). É uma alternativa ao Intercom, Zendesk, Salesforce Service Cloud e outros sistemas de suporte ao cliente. Chatwoot permite que empresas conversem com seus clientes através de múltiplos canais em uma única plataforma.`,
        category: 'Geral',
        tags: ['introdução', 'overview'],
      },
      {
        title: 'Canais Suportados',
        content: `Chatwoot suporta os seguintes canais:
- WhatsApp (via WhatsApp Business API ou Cloud API)
- Website (Widget de chat)
- Facebook Messenger
- Instagram Direct
- Twitter DM
- Telegram
- Email
- SMS
- Line
- API (canal customizado)

Todos os canais são gerenciados em uma caixa de entrada unificada.`,
        category: 'Canais',
        tags: ['canais', 'integrações', 'whatsapp', 'facebook'],
      },
      {
        title: 'Caixa de Entrada (Inbox)',
        content: `A caixa de entrada é onde todas as conversas dos diferentes canais são centralizadas. Características:
- Visualização unificada de todas as conversas
- Filtros por status (aberto, resolvido, pendente)
- Atribuição de conversas a agentes específicos
- Priorização de conversas
- Busca de conversas
- Labels e tags para organização`,
        category: 'Recursos',
        tags: ['inbox', 'caixa de entrada', 'conversas'],
      },
      {
        title: 'Agentes e Times',
        content: `Chatwoot permite gerenciar múltiplos agentes e organizá-los em times:
- Criação de agentes com diferentes níveis de permissão (administrador, agente)
- Organização de agentes em times
- Atribuição automática ou manual de conversas
- Monitoramento de carga de trabalho dos agentes
- Relatórios de desempenho individual e por time`,
        category: 'Gestão',
        tags: ['agentes', 'times', 'equipe'],
      },
      {
        title: 'Respostas Prontas (Canned Responses)',
        content: `Respostas prontas são mensagens pré-definidas que agilizam o atendimento:
- Criação de templates de resposta
- Atalhos para inserir respostas rapidamente
- Personalização com variáveis (nome do cliente, etc)
- Compartilhamento entre agentes
- Organização por categorias`,
        category: 'Recursos',
        tags: ['respostas prontas', 'templates', 'automação'],
      },
      {
        title: 'Automações',
        content: `Chatwoot oferece poderosas automações:
- Regras de atribuição automática
- Respostas automáticas baseadas em condições
- Alteração automática de status
- Adição automática de labels
- Envio de mensagens programadas
- Webhooks para integrações externas`,
        category: 'Automação',
        tags: ['automação', 'workflows', 'webhooks'],
      },
      {
        title: 'Integrações',
        content: `Chatwoot se integra com diversas ferramentas:
- Slack (notificações e gestão)
- Webhooks (integração customizada)
- API REST completa
- Dialogflow (chatbot AI)
- Google Analytics
- Sentry (monitoramento de erros)
- Zapier e Make.com (automações)`,
        category: 'Integrações',
        tags: ['integrações', 'api', 'webhooks'],
      },
      {
        title: 'WhatsApp Business',
        content: `Integração com WhatsApp no Chatwoot:
- Suporte a WhatsApp Business API (oficial)
- Suporte a WhatsApp Cloud API
- Envio e recebimento de mensagens
- Suporte a mensagens de mídia (imagem, áudio, vídeo, documento)
- Templates de mensagem do WhatsApp
- Indicadores de digitação
- Confirmações de leitura
- Reações com emoji (em versões recentes)`,
        category: 'WhatsApp',
        tags: ['whatsapp', 'mensagens', 'mídia'],
      },
      {
        title: 'Relatórios e Análises',
        content: `Chatwoot oferece relatórios detalhados:
- Tempo médio de primeira resposta
- Tempo médio de resolução
- Volume de conversas
- Taxa de resolução
- Satisfação do cliente (CSAT)
- Desempenho por agente
- Desempenho por canal
- Relatórios customizados`,
        category: 'Relatórios',
        tags: ['relatórios', 'analytics', 'métricas'],
      },
      {
        title: 'Aplicativos Mobile',
        content: `Chatwoot possui aplicativos mobile para iOS e Android:
- Notificações push em tempo real
- Todas as funcionalidades da versão web
- Responder conversas em movimento
- Visualizar relatórios
- Gerenciar configurações`,
        category: 'Mobile',
        tags: ['mobile', 'app', 'ios', 'android'],
      },
      {
        title: 'Chatbots e IA',
        content: `Chatwoot suporta chatbots e IA:
- Integração com Dialogflow
- Webhooks para chatbots customizados
- Handoff de bot para agente humano
- Respostas automáticas inteligentes
- Suporte a múltiplas línguas`,
        category: 'IA',
        tags: ['chatbot', 'ia', 'automação'],
      },
      {
        title: 'Preços e Planos',
        content: `Chatwoot oferece diferentes opções:
- Self-hosted (gratuito, código aberto)
- Chatwoot Cloud (planos pagos com hospedagem gerenciada)
- Planos Enterprise com suporte dedicado
- Sem limite de conversas (na maioria dos planos)
- Cobrança por agente`,
        category: 'Comercial',
        tags: ['preços', 'planos', 'custos'],
      },
      {
        title: 'Segurança e Privacidade',
        content: `Chatwoot leva segurança a sério:
- Criptografia de dados em trânsito (HTTPS)
- Suporte a autenticação SSO
- Controle de acesso baseado em funções (RBAC)
- Conformidade com GDPR
- Self-hosting para máximo controle de dados
- Backups automáticos (no Cloud)`,
        category: 'Segurança',
        tags: ['segurança', 'privacidade', 'gdpr'],
      },
    ];
  }

  async refreshKnowledge() {
    logger.info('Refreshing Chatwoot knowledge...');
    return await this.loadChatwootKnowledge();
  }
}

export default new ChatwootKnowledgeLoaderService();
